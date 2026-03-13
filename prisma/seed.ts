import "dotenv/config";
import { PrismaClient, MemberRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Starting seed...");

    // ─── Users ────────────────────────────────────────────────────────────────

    const usersData = [
        { fullName: "Alice Owens", email: "alice@example.com", password: "password123" },
        { fullName: "Bob Marchetti", email: "bob@example.com", password: "password123" },
        { fullName: "Carol Chen", email: "carol@example.com", password: "password123" },
        { fullName: "David Kim", email: "david@example.com", password: "password123" },
        { fullName: "Eva Rossi", email: "eva@example.com", password: "password123" },
    ];

    const createdProfiles: Record<string, Awaited<ReturnType<typeof prisma.profile.create>>> = {};

    for (const u of usersData) {
        const passwordHash = await hash(u.password, 12);

        const userAuth = await prisma.userAuth.create({
            data: {
                email: u.email,
                passwordHash,
                profile: {
                    create: {
                        fullName: u.fullName,
                        email: u.email,
                    },
                },
            },
            include: { profile: true },
        });

        createdProfiles[u.email] = userAuth.profile!;
        console.log(`  ✅ Created user: ${u.fullName} <${u.email}>`);
    }

    const alice = createdProfiles["alice@example.com"];
    const bob = createdProfiles["bob@example.com"];
    const carol = createdProfiles["carol@example.com"];
    const david = createdProfiles["david@example.com"];
    const eva = createdProfiles["eva@example.com"];

    // ─── Projects ─────────────────────────────────────────────────────────────

    const projectsData = [
        {
            name: "Acme Platform",
            description: "Core infrastructure for the Acme SaaS platform.",
            owner: alice,
            members: [
                { profile: bob, role: MemberRole.EDITOR, canRevealSecrets: true, canShareSecrets: true },
                { profile: carol, role: MemberRole.VIEWER, canRevealSecrets: false, canShareSecrets: false },
            ],
            environments: [
                { name: "Development", slug: "development" },
                { name: "Staging", slug: "staging" },
                { name: "Production", slug: "production" },
            ],
        },
        {
            name: "Internal Tooling",
            description: "Internal scripts and tooling for the engineering team.",
            owner: bob,
            members: [
                { profile: david, role: MemberRole.EDITOR, canRevealSecrets: true, canShareSecrets: false },
                { profile: eva, role: MemberRole.VIEWER, canRevealSecrets: false, canShareSecrets: false },
                { profile: alice, role: MemberRole.EDITOR, canRevealSecrets: true, canShareSecrets: true },
            ],
            environments: [
                { name: "Development", slug: "development" },
                { name: "Production", slug: "production" },
            ],
        },
        {
            name: "Marketing Site",
            description: "Public-facing marketing website and landing pages.",
            owner: carol,
            members: [
                { profile: eva, role: MemberRole.EDITOR, canRevealSecrets: false, canShareSecrets: false },
                { profile: bob, role: MemberRole.VIEWER, canRevealSecrets: false, canShareSecrets: false },
            ],
            environments: [
                { name: "Preview", slug: "preview" },
                { name: "Production", slug: "production" },
            ],
        },
    ];

    for (const proj of projectsData) {
        const project = await prisma.project.create({
            data: {
                name: proj.name,
                description: proj.description,
                ownerId: proj.owner.id,
            },
        });

        console.log(`\n  📁 Project: "${project.name}" (owner: ${proj.owner.fullName})`);

        // Owner entry in project_members
        await prisma.projectMember.create({
            data: {
                projectId: project.id,
                userId: proj.owner.id,
                role: MemberRole.OWNER,
                canRevealSecrets: true,
                canShareSecrets: true,
            },
        });

        // Other members
        for (const m of proj.members) {
            await prisma.projectMember.create({
                data: {
                    projectId: project.id,
                    userId: m.profile.id,
                    role: m.role,
                    canRevealSecrets: m.canRevealSecrets,
                    canShareSecrets: m.canShareSecrets,
                },
            });
            console.log(`    👤 Member: ${m.profile.fullName} (${m.role})`);
        }

        // Environments + config entries
        for (const env of proj.environments) {
            const environment = await prisma.environment.create({
                data: {
                    projectId: project.id,
                    name: env.name,
                    slug: env.slug,
                },
            });

            const isProd = env.slug === "production";

            // Shared config entries per environment
            const entries = [
                {
                    key: "APP_NAME",
                    valuePlain: proj.name,
                    isSecret: false,
                    isRequired: true,
                    description: "Human-readable application name",
                },
                {
                    key: "DATABASE_URL",
                    valueEncrypted: `enc:postgres://user:secret@db-${env.slug}.internal:5432/${project.name.toLowerCase().replace(/ /g, "_")}`,
                    isSecret: true,
                    isRequired: true,
                    description: "Primary database connection string",
                },
                {
                    key: "SECRET_KEY",
                    valueEncrypted: `enc:${randomBytes(32).toString("hex")}`,
                    isSecret: true,
                    isRequired: true,
                    description: "App secret key used for signing tokens",
                },
                {
                    key: "LOG_LEVEL",
                    valuePlain: isProd ? "warn" : "debug",
                    isSecret: false,
                    isRequired: false,
                    description: "Logging verbosity level",
                },
                {
                    key: "FEATURE_FLAG_NEW_UI",
                    valuePlain: isProd ? "false" : "true",
                    isSecret: false,
                    isRequired: false,
                    description: "Toggle for the redesigned UI rollout",
                },
            ];

            for (const entry of entries) {
                await prisma.configEntry.create({
                    data: {
                        environmentId: environment.id,
                        key: entry.key,
                        valuePlain: entry.valuePlain ?? null,
                        valueEncrypted: entry.valueEncrypted ?? null,
                        isSecret: entry.isSecret,
                        isRequired: entry.isRequired,
                        description: entry.description,
                        createdBy: proj.owner.id,
                        updatedBy: proj.owner.id,
                    },
                });
            }

            console.log(`    🌍 Environment: ${env.name} (${entries.length} config entries)`);
        }

        // Audit log — project created
        await prisma.auditLog.create({
            data: {
                projectId: project.id,
                actorId: proj.owner.id,
                action: "PROJECT_CREATED",
                entityType: "Project",
                entityId: project.id,
                metadata: { projectName: project.name },
            },
        });
    }

    // ─── Sessions ─────────────────────────────────────────────────────────────

    const userAuths = await prisma.userAuth.findMany();
    for (const userAuth of userAuths) {
        await prisma.session.create({
            data: {
                userId: userAuth.id,
                sessionToken: randomBytes(48).toString("hex"),
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
            },
        });
    }

    console.log("\n  🔐 Created sessions for all users");
    console.log("\n✨ Seed complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());