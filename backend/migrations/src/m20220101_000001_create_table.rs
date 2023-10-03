use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create the chain_id table.
        manager
            .create_table(
                Table::create()
                    .table(ChainId::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(ChainId::ChainId)
                            .primary_key()
                            .small_integer()
                            .not_null()
                            .unique_key(),
                    )
                    .to_owned(),
            )
            .await?;

        // Create the last_processed_version table.
        manager
            .create_table(
                Table::create()
                    .table(LastProcessedVersion::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(LastProcessedVersion::ProcessorName)
                            .string()
                            .primary_key()
                            .not_null()
                            .unique_key(),
                    )
                    .col(
                        ColumnDef::new(LastProcessedVersion::Version)
                            .big_integer()
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await?;

        // Create the pixel attribution table.
        manager
            .create_table(
                Table::create()
                    .table(PixelAttribution::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(PixelAttribution::Index)
                            .big_integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PixelAttribution::CanvasAddress)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PixelAttribution::ArtistAddress)
                            .string()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PixelAttribution::DrawnAtSecs)
                            .big_integer()
                            .not_null(),
                    )
                    .primary_key(
                        &mut IndexCreateStatement::new()
                            .col(PixelAttribution::Index)
                            .col(PixelAttribution::CanvasAddress)
                            .to_owned(),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(ChainId::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(LastProcessedVersion::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(PixelAttribution::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum ChainId {
    Table,
    ChainId,
}

#[derive(DeriveIden)]
enum LastProcessedVersion {
    Table,
    ProcessorName,
    Version,
}

#[derive(DeriveIden)]
enum PixelAttribution {
    Table,
    Index,
    CanvasAddress,
    ArtistAddress,
    DrawnAtSecs,
}
