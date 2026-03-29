# Database Migrations

This directory contains all database migration files for schema versioning.

## Migration Strategy

We use Prisma for schema versioning and migration management.

### Commands

- **Create migration**: `npx prisma migrate dev --name <description>`
- **Apply migrations**: `npx prisma migrate deploy`
- **Check status**: `npx prisma migrate status`
- **Rollback**: Manual - use down migration scripts

### Migration Workflow

1. **Development**: Make schema changes in `prisma/schema.prisma`
2. **Generate migration**: `npx prisma migrate dev --name add_user_preferences`
3. **Review**: Check generated SQL in `migrations/<timestamp>_<name>/`
4. **Test**: Verify migration works locally
5. **Commit**: Add migration files to git
6. **Deploy**: CI/CD runs `prisma migrate deploy` automatically

### Version Tracking

All migrations are tracked in the `_prisma_migrations` table:
- `id`: Migration identifier
- `checksum`: File integrity check
- `finished_at`: Execution timestamp
- `migration_name`: Descriptive name
- `logs`: Execution logs
- `rolled_back_at`: Rollback timestamp (if applicable)

### CI/CD Integration

Add to your build pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Run database migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Best Practices

1. **Never edit existing migrations** - Create new ones instead
2. **Test locally first** - Always run migrations in dev before deploying
3. **Backup production** - Always backup before running migrations
4. **Document breaking changes** - Add comments explaining schema changes
5. **Keep migrations small** - One logical change per migration

## Rollback Procedure

For MongoDB, Prisma doesn't support automatic rollbacks. Manual steps:

1. Restore from backup (recommended)
2. Or create reverse migration manually
3. Update `_prisma_migrations` table to mark as rolled back

## Migration History

### Initial Setup (2026-03-29)
- Added Prisma migration framework
- Configured for MongoDB
- Created migration directory structure
- Documented current schema (users, accounts, sessions)
