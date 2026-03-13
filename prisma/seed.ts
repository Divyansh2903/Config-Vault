import "dotenv/config"
import { randomBytes, randomUUID } from "crypto"
import { MemberRole } from "@prisma/client"
import { prisma } from "../lib/db/prisma"
import { hashPassword } from "../lib/auth/password"
import { encrypt } from "../lib/security/encryption"

const DEFAULT_PASSWORD = "Password123!"

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function buildConfigEntry(input: {
  id?: string
  environmentId: string
  key: string
  value: string
  isSecret: boolean
  description?: string
  isRequired?: boolean
  createdBy: string
  updatedBy?: string
  rotatedDaysAgo?: number
}) {
  return {
    id: input.id ?? randomUUID(),
    environmentId: input.environmentId,
    key: input.key,
    valueEncrypted: input.isSecret ? encrypt(input.value) : null,
    valuePlain: input.isSecret ? null : input.value,
    isSecret: input.isSecret,
    description: input.description ?? null,
    isRequired: input.isRequired ?? false,
    lastRotatedAt:
      input.isSecret && input.rotatedDaysAgo
        ? daysAgo(input.rotatedDaysAgo)
        : null,
    createdBy: input.createdBy,
    updatedBy: input.updatedBy ?? input.createdBy,
  }
}

async function main() {
  const ids = {
    users: {
      alice: randomUUID(),
      bob: randomUUID(),
      clara: randomUUID(),
      diego: randomUUID(),
      eve: randomUUID(),
    },
    projects: {
      acme: randomUUID(),
      mobile: randomUUID(),
      marketing: randomUUID(),
    },
    environments: {
      acmeDev: randomUUID(),
      acmeStaging: randomUUID(),
      acmeProd: randomUUID(),
      mobileDev: randomUUID(),
      mobileStaging: randomUUID(),
      mobileProd: randomUUID(),
      marketingDev: randomUUID(),
      marketingStaging: randomUUID(),
      marketingProd: randomUUID(),
    },
    sharedEntries: {
      acmeProdStripe: randomUUID(),
      mobileStagingJwt: randomUUID(),
      marketingProdCms: randomUUID(),
    },
  }

  const users = [
    {
      id: ids.users.alice,
      fullName: "Alice Johnson",
      email: "alice@example.com",
      password: DEFAULT_PASSWORD,
    },
    {
      id: ids.users.bob,
      fullName: "Bob Lee",
      email: "bob@example.com",
      password: DEFAULT_PASSWORD,
    },
    {
      id: ids.users.clara,
      fullName: "Clara Smith",
      email: "clara@example.com",
      password: DEFAULT_PASSWORD,
    },
    {
      id: ids.users.diego,
      fullName: "Diego Rivera",
      email: "diego@example.com",
      password: DEFAULT_PASSWORD,
    },
    {
      id: ids.users.eve,
      fullName: "Eve Patel",
      email: "eve@example.com",
      password: DEFAULT_PASSWORD,
    },
  ]

  const userAuthRows = await Promise.all(
    users.map(async (user) => ({
      id: user.id,
      email: user.email,
      passwordHash: await hashPassword(user.password),
    })),
  )

  const profileRows = users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  }))

  const projectRows = [
    {
      id: ids.projects.acme,
      name: "Acme SaaS Platform",
      description: "Core SaaS app used by the product and customer success teams.",
      ownerId: ids.users.alice,
    },
    {
      id: ids.projects.mobile,
      name: "Mobile Commerce API",
      description: "Backend services powering the iOS and Android shopping apps.",
      ownerId: ids.users.diego,
    },
    {
      id: ids.projects.marketing,
      name: "Marketing Site",
      description: "Public website, CMS integrations, and campaign landing pages.",
      ownerId: ids.users.eve,
    },
  ]

  const memberRows = [
    {
      projectId: ids.projects.acme,
      userId: ids.users.alice,
      role: MemberRole.OWNER,
      canRevealSecrets: true,
      canShareSecrets: true,
    },
    {
      projectId: ids.projects.acme,
      userId: ids.users.bob,
      role: MemberRole.EDITOR,
      canRevealSecrets: true,
      canShareSecrets: true,
    },
    {
      projectId: ids.projects.acme,
      userId: ids.users.clara,
      role: MemberRole.VIEWER,
      canRevealSecrets: false,
      canShareSecrets: false,
    },
    {
      projectId: ids.projects.acme,
      userId: ids.users.diego,
      role: MemberRole.EDITOR,
      canRevealSecrets: true,
      canShareSecrets: false,
    },
    {
      projectId: ids.projects.mobile,
      userId: ids.users.diego,
      role: MemberRole.OWNER,
      canRevealSecrets: true,
      canShareSecrets: true,
    },
    {
      projectId: ids.projects.mobile,
      userId: ids.users.alice,
      role: MemberRole.EDITOR,
      canRevealSecrets: true,
      canShareSecrets: true,
    },
    {
      projectId: ids.projects.mobile,
      userId: ids.users.eve,
      role: MemberRole.EDITOR,
      canRevealSecrets: true,
      canShareSecrets: true,
    },
    {
      projectId: ids.projects.mobile,
      userId: ids.users.clara,
      role: MemberRole.VIEWER,
      canRevealSecrets: false,
      canShareSecrets: false,
    },
    {
      projectId: ids.projects.marketing,
      userId: ids.users.eve,
      role: MemberRole.OWNER,
      canRevealSecrets: true,
      canShareSecrets: true,
    },
    {
      projectId: ids.projects.marketing,
      userId: ids.users.bob,
      role: MemberRole.EDITOR,
      canRevealSecrets: false,
      canShareSecrets: true,
    },
    {
      projectId: ids.projects.marketing,
      userId: ids.users.clara,
      role: MemberRole.VIEWER,
      canRevealSecrets: false,
      canShareSecrets: false,
    },
  ].map((member) => ({
    id: randomUUID(),
    ...member,
  }))

  const environmentRows = [
    {
      id: ids.environments.acmeDev,
      projectId: ids.projects.acme,
      name: "Development",
      slug: "development",
    },
    {
      id: ids.environments.acmeStaging,
      projectId: ids.projects.acme,
      name: "Staging",
      slug: "staging",
    },
    {
      id: ids.environments.acmeProd,
      projectId: ids.projects.acme,
      name: "Production",
      slug: "production",
    },
    {
      id: ids.environments.mobileDev,
      projectId: ids.projects.mobile,
      name: "Development",
      slug: "development",
    },
    {
      id: ids.environments.mobileStaging,
      projectId: ids.projects.mobile,
      name: "Staging",
      slug: "staging",
    },
    {
      id: ids.environments.mobileProd,
      projectId: ids.projects.mobile,
      name: "Production",
      slug: "production",
    },
    {
      id: ids.environments.marketingDev,
      projectId: ids.projects.marketing,
      name: "Development",
      slug: "development",
    },
    {
      id: ids.environments.marketingStaging,
      projectId: ids.projects.marketing,
      name: "Staging",
      slug: "staging",
    },
    {
      id: ids.environments.marketingProd,
      projectId: ids.projects.marketing,
      name: "Production",
      slug: "production",
    },
  ]

  const configEntryRows = [
    buildConfigEntry({
      environmentId: ids.environments.acmeDev,
      key: "DATABASE_URL",
      value: "postgresql://acme-dev:secret@localhost:5432/acme_dev",
      isSecret: true,
      description: "Local development database",
      isRequired: true,
      createdBy: ids.users.alice,
      updatedBy: ids.users.bob,
      rotatedDaysAgo: 10,
    }),
    buildConfigEntry({
      environmentId: ids.environments.acmeDev,
      key: "NEXT_PUBLIC_APP_URL",
      value: "http://localhost:3000",
      isSecret: false,
      description: "Frontend URL for local development",
      isRequired: true,
      createdBy: ids.users.alice,
    }),
    buildConfigEntry({
      environmentId: ids.environments.acmeDev,
      key: "REDIS_URL",
      value: "redis://localhost:6379",
      isSecret: false,
      description: "Redis endpoint for queues and caching",
      createdBy: ids.users.bob,
    }),
    buildConfigEntry({
      environmentId: ids.environments.acmeStaging,
      key: "DATABASE_URL",
      value: "postgresql://acme-staging:secret@db.internal:5432/acme_staging",
      isSecret: true,
      description: "Staging database connection",
      isRequired: true,
      createdBy: ids.users.alice,
      updatedBy: ids.users.bob,
      rotatedDaysAgo: 7,
    }),
    buildConfigEntry({
      environmentId: ids.environments.acmeStaging,
      key: "NEXT_PUBLIC_APP_URL",
      value: "https://staging.acme.example.com",
      isSecret: false,
      description: "Staging frontend URL",
      isRequired: true,
      createdBy: ids.users.bob,
    }),
    buildConfigEntry({
      environmentId: ids.environments.acmeStaging,
      key: "STRIPE_WEBHOOK_SECRET",
      value: "whsec_staging_acme_12345",
      isSecret: true,
      description: "Stripe webhook signing secret",
      createdBy: ids.users.bob,
      rotatedDaysAgo: 3,
    }),
    buildConfigEntry({
      id: ids.sharedEntries.acmeProdStripe,
      environmentId: ids.environments.acmeProd,
      key: "STRIPE_SECRET_KEY",
      value: "sk_live_acme_prod_1234567890",
      isSecret: true,
      description: "Stripe secret used by checkout and billing jobs",
      isRequired: true,
      createdBy: ids.users.alice,
      updatedBy: ids.users.alice,
      rotatedDaysAgo: 1,
    }),
    buildConfigEntry({
      environmentId: ids.environments.acmeProd,
      key: "NEXT_PUBLIC_APP_URL",
      value: "https://app.acme.example.com",
      isSecret: false,
      description: "Primary production URL",
      isRequired: true,
      createdBy: ids.users.alice,
    }),
    buildConfigEntry({
      environmentId: ids.environments.acmeProd,
      key: "SENTRY_DSN",
      value: "https://public@sentry.example.com/42",
      isSecret: false,
      description: "Frontend error reporting DSN",
      createdBy: ids.users.bob,
    }),
    buildConfigEntry({
      environmentId: ids.environments.mobileDev,
      key: "API_BASE_URL",
      value: "http://localhost:4000",
      isSecret: false,
      description: "Local API origin for mobile developers",
      isRequired: true,
      createdBy: ids.users.diego,
    }),
    buildConfigEntry({
      environmentId: ids.environments.mobileDev,
      key: "JWT_SECRET",
      value: "mobile-dev-jwt-secret",
      isSecret: true,
      description: "JWT signing key for the dev environment",
      isRequired: true,
      createdBy: ids.users.diego,
      rotatedDaysAgo: 14,
    }),
    buildConfigEntry({
      environmentId: ids.environments.mobileDev,
      key: "FEATURE_FLAG_CHECKOUT_V2",
      value: "true",
      isSecret: false,
      description: "Enables the new checkout path",
      createdBy: ids.users.eve,
    }),
    buildConfigEntry({
      id: ids.sharedEntries.mobileStagingJwt,
      environmentId: ids.environments.mobileStaging,
      key: "JWT_SECRET",
      value: "mobile-staging-jwt-secret",
      isSecret: true,
      description: "JWT signing key for staging",
      isRequired: true,
      createdBy: ids.users.diego,
      updatedBy: ids.users.alice,
      rotatedDaysAgo: 4,
    }),
    buildConfigEntry({
      environmentId: ids.environments.mobileStaging,
      key: "API_BASE_URL",
      value: "https://staging-api.mobile.example.com",
      isSecret: false,
      description: "Staging API origin",
      isRequired: true,
      createdBy: ids.users.alice,
    }),
    buildConfigEntry({
      environmentId: ids.environments.mobileStaging,
      key: "FIREBASE_CONFIG_JSON",
      value: '{"projectId":"mobile-staging","appId":"1:123:web:abc"}',
      isSecret: true,
      description: "Firebase app credentials",
      createdBy: ids.users.eve,
      rotatedDaysAgo: 8,
    }),
    buildConfigEntry({
      environmentId: ids.environments.mobileProd,
      key: "API_BASE_URL",
      value: "https://api.mobile.example.com",
      isSecret: false,
      description: "Production API origin",
      isRequired: true,
      createdBy: ids.users.diego,
    }),
    buildConfigEntry({
      environmentId: ids.environments.mobileProd,
      key: "APPLE_SHARED_SECRET",
      value: "apple-prod-shared-secret",
      isSecret: true,
      description: "App Store subscription validation secret",
      isRequired: true,
      createdBy: ids.users.diego,
      rotatedDaysAgo: 2,
    }),
    buildConfigEntry({
      environmentId: ids.environments.mobileProd,
      key: "LOG_LEVEL",
      value: "warn",
      isSecret: false,
      description: "Runtime log verbosity",
      createdBy: ids.users.alice,
    }),
    buildConfigEntry({
      environmentId: ids.environments.marketingDev,
      key: "NEXT_PUBLIC_SITE_URL",
      value: "http://localhost:3001",
      isSecret: false,
      description: "Local site URL",
      isRequired: true,
      createdBy: ids.users.eve,
    }),
    buildConfigEntry({
      environmentId: ids.environments.marketingDev,
      key: "CMS_PREVIEW_TOKEN",
      value: "cms-preview-dev-token",
      isSecret: true,
      description: "Content preview token for local testing",
      createdBy: ids.users.eve,
      rotatedDaysAgo: 12,
    }),
    buildConfigEntry({
      environmentId: ids.environments.marketingDev,
      key: "ENABLE_NEW_HOMEPAGE",
      value: "false",
      isSecret: false,
      description: "Feature flag for the redesigned homepage",
      createdBy: ids.users.bob,
    }),
    buildConfigEntry({
      environmentId: ids.environments.marketingStaging,
      key: "NEXT_PUBLIC_SITE_URL",
      value: "https://staging.marketing.example.com",
      isSecret: false,
      description: "Staging site URL",
      isRequired: true,
      createdBy: ids.users.eve,
    }),
    buildConfigEntry({
      environmentId: ids.environments.marketingStaging,
      key: "CMS_SPACE_ID",
      value: "marketing-staging-space",
      isSecret: false,
      description: "CMS space identifier",
      createdBy: ids.users.bob,
    }),
    buildConfigEntry({
      environmentId: ids.environments.marketingStaging,
      key: "ANALYTICS_API_KEY",
      value: "analytics-staging-key",
      isSecret: true,
      description: "Analytics provider write key",
      createdBy: ids.users.eve,
      rotatedDaysAgo: 6,
    }),
    buildConfigEntry({
      id: ids.sharedEntries.marketingProdCms,
      environmentId: ids.environments.marketingProd,
      key: "CMS_PREVIEW_TOKEN",
      value: "cms-preview-prod-token",
      isSecret: true,
      description: "Production preview token for content editors",
      isRequired: true,
      createdBy: ids.users.eve,
      updatedBy: ids.users.bob,
      rotatedDaysAgo: 5,
    }),
    buildConfigEntry({
      environmentId: ids.environments.marketingProd,
      key: "NEXT_PUBLIC_SITE_URL",
      value: "https://www.example.com",
      isSecret: false,
      description: "Public production domain",
      isRequired: true,
      createdBy: ids.users.eve,
    }),
    buildConfigEntry({
      environmentId: ids.environments.marketingProd,
      key: "GA_MEASUREMENT_ID",
      value: "G-ABC123XYZ",
      isSecret: false,
      description: "Google Analytics measurement id",
      createdBy: ids.users.bob,
    }),
  ]

  const auditLogRows = [
    {
      id: randomUUID(),
      projectId: ids.projects.acme,
      actorId: ids.users.alice,
      action: "PROJECT_CREATED",
      entityType: "project",
      entityId: ids.projects.acme,
      metadata: { source: "seed", projectName: "Acme SaaS Platform" },
    },
    {
      id: randomUUID(),
      projectId: ids.projects.acme,
      actorId: ids.users.bob,
      action: "CONFIG_ENTRY_UPDATED",
      entityType: "config_entry",
      entityId: ids.sharedEntries.acmeProdStripe,
      metadata: { key: "STRIPE_SECRET_KEY", environment: "production" },
    },
    {
      id: randomUUID(),
      projectId: ids.projects.mobile,
      actorId: ids.users.diego,
      action: "PROJECT_CREATED",
      entityType: "project",
      entityId: ids.projects.mobile,
      metadata: { source: "seed", projectName: "Mobile Commerce API" },
    },
    {
      id: randomUUID(),
      projectId: ids.projects.mobile,
      actorId: ids.users.alice,
      action: "SECRET_SHARED",
      entityType: "config_entry",
      entityId: ids.sharedEntries.mobileStagingJwt,
      metadata: { key: "JWT_SECRET", recipient: "qa-team@example.com" },
    },
    {
      id: randomUUID(),
      projectId: ids.projects.marketing,
      actorId: ids.users.eve,
      action: "PROJECT_CREATED",
      entityType: "project",
      entityId: ids.projects.marketing,
      metadata: { source: "seed", projectName: "Marketing Site" },
    },
    {
      id: randomUUID(),
      projectId: ids.projects.marketing,
      actorId: ids.users.bob,
      action: "SECRET_ROTATED",
      entityType: "config_entry",
      entityId: ids.sharedEntries.marketingProdCms,
      metadata: { key: "CMS_PREVIEW_TOKEN", rotationReason: "routine" },
    },
  ]

  const shareLinkRows = [
    {
      id: randomUUID(),
      configEntryId: ids.sharedEntries.acmeProdStripe,
      token: "share_acme_prod_stripe",
      createdBy: ids.users.alice,
      expiresAt: daysFromNow(7),
      maxViews: 5,
      currentViews: 1,
      revokedAt: null,
    },
    {
      id: randomUUID(),
      configEntryId: ids.sharedEntries.mobileStagingJwt,
      token: "share_mobile_stage_jwt",
      createdBy: ids.users.alice,
      expiresAt: daysFromNow(3),
      maxViews: 3,
      currentViews: 0,
      revokedAt: null,
    },
    {
      id: randomUUID(),
      configEntryId: ids.sharedEntries.marketingProdCms,
      token: "share_marketing_prod_cms",
      createdBy: ids.users.bob,
      expiresAt: daysFromNow(1),
      maxViews: 1,
      currentViews: 1,
      revokedAt: daysAgo(0),
    },
  ]

  const sessionRows = [
    {
      id: randomUUID(),
      userId: ids.users.alice,
      sessionToken: randomBytes(32).toString("hex"),
      expiresAt: daysFromNow(7),
    },
    {
      id: randomUUID(),
      userId: ids.users.diego,
      sessionToken: randomBytes(32).toString("hex"),
      expiresAt: daysFromNow(5),
    },
    {
      id: randomUUID(),
      userId: ids.users.eve,
      sessionToken: randomBytes(32).toString("hex"),
      expiresAt: daysFromNow(2),
    },
  ]

  const passwordResetTokenRows = [
    {
      id: randomUUID(),
      userId: ids.users.clara,
      token: randomBytes(24).toString("hex"),
      expiresAt: daysFromNow(1),
      usedAt: null,
    },
    {
      id: randomUUID(),
      userId: ids.users.bob,
      token: randomBytes(24).toString("hex"),
      expiresAt: daysAgo(1),
      usedAt: daysAgo(2),
    },
  ]

  await prisma.$transaction(async (tx) => {
    await tx.shareLink.deleteMany()
    await tx.auditLog.deleteMany()
    await tx.configEntry.deleteMany()
    await tx.environment.deleteMany()
    await tx.projectMember.deleteMany()
    await tx.project.deleteMany()
    await tx.session.deleteMany()
    await tx.passwordResetToken.deleteMany()
    await tx.profile.deleteMany()
    await tx.userAuth.deleteMany()

    await tx.userAuth.createMany({ data: userAuthRows })
    await tx.profile.createMany({ data: profileRows })
    await tx.project.createMany({ data: projectRows })
    await tx.projectMember.createMany({ data: memberRows })
    await tx.environment.createMany({ data: environmentRows })
    await tx.configEntry.createMany({ data: configEntryRows })
    await tx.auditLog.createMany({ data: auditLogRows })
    await tx.shareLink.createMany({ data: shareLinkRows })
    await tx.session.createMany({ data: sessionRows })
    await tx.passwordResetToken.createMany({ data: passwordResetTokenRows })
  })

  console.log("Database seeded successfully")
  console.log(`Users: ${users.length}`)
  console.log(`Projects: ${projectRows.length}`)
  console.log(`Project members: ${memberRows.length}`)
  console.log(`Environments: ${environmentRows.length}`)
  console.log(`Config entries: ${configEntryRows.length}`)
  console.log(`Audit logs: ${auditLogRows.length}`)
  console.log(`Share links: ${shareLinkRows.length}`)
  console.log(`Sessions: ${sessionRows.length}`)
  console.log(`Password reset tokens: ${passwordResetTokenRows.length}`)
  console.log("")
  console.log("Seed user credentials")
  for (const user of users) {
    console.log(`- ${user.email} / ${user.password}`)
  }
}

main()
  .catch((error) => {
    console.error("Seed failed")
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
