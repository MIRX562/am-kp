"use server";

import prisma from "@/lib/db";
import { createAssetSchema, editAssetSchema } from "@/schemas/asset-schema";
import { z } from "zod";
import { createActivityLog } from "./activities-actions";
import { getCurrentSession } from "@/lib/auth";

export const createAsset = async (data: z.infer<typeof createAssetSchema>) => {
  const { user } = await getCurrentSession();
  if (!user) throw new Error("Not Authorized");

  const value = createAssetSchema.parse(data);

  try {
    const asset = await prisma.asset.create({
      data: {
        name: value.name,
        type_id: value.type_id,
        status: value.status,
        purchase_date: value.purchase_date,
        initial_value: value.initial_value,
        salvage_value: value.salvage_value,
        useful_life: value.useful_life,
      },
    });

    await prisma.assetLocationHistory.create({
      data: {
        asset_id: asset.id,
        location_id: data.location_id,
        assigned_date: new Date(),
      },
    });

    await prisma.assetLifecycle.create({
      data: {
        asset_id: asset.id,
        stage: value.lifecycle_stage,
        change_date: new Date(),
        notes:
          data.lifecycle_notes ||
          `Asset created with stage: ${value.lifecycle_stage}`,
      },
    });

    createActivityLog({
      action: `Add new asset: ${asset.name}`,
      target_type: "ASSET",
      target_id: asset.id,
    });

    return asset;
  } catch (error) {
    console.error(`[createAsset] Error:`, error);
    throw new Error("Failed to create asset with associated records");
  }
};

export const editAsset = async (
  data: z.infer<typeof editAssetSchema>,
  locationId?: number,
  lifecycleNotes?: string
) => {
  const { user } = await getCurrentSession();
  if (!user) throw new Error("Not Authorized");
  const value = editAssetSchema.parse(data);

  try {
    const asset = await prisma.asset.update({
      where: { id: value.id },
      data: {
        name: value.name,
        type_id: value.type_id,
        status: value.status,
        purchase_date: value.purchase_date,
        initial_value: value.initial_value,
        salvage_value: value.salvage_value,
        useful_life: value.useful_life,
      },
    });

    if (locationId) {
      const currentLocation = await prisma.assetLocationHistory.findFirst({
        where: {
          asset_id: asset.id,
          release_date: null,
        },
      });

      if (currentLocation && currentLocation.location_id !== locationId) {
        await prisma.assetLocationHistory.updateMany({
          where: {
            asset_id: asset.id,
            release_date: null,
          },
          data: {
            release_date: new Date(),
          },
        });

        await prisma.assetLocationHistory.create({
          data: {
            asset_id: asset.id,
            location_id: locationId,
            assigned_date: new Date(),
          },
        });
      }
    }

    if (value.lifecycle_stage) {
      const currentLifecycle = await prisma.assetLifecycle.findFirst({
        where: {
          asset_id: asset.id,
        },
        orderBy: {
          change_date: "desc",
        },
      });

      if (
        !currentLifecycle ||
        currentLifecycle.stage !== value.lifecycle_stage ||
        lifecycleNotes !== currentLifecycle.notes
      ) {
        await prisma.assetLifecycle.create({
          data: {
            asset_id: asset.id,
            stage: value.lifecycle_stage,
            change_date: new Date(),
            notes:
              lifecycleNotes ||
              `Lifecycle stage updated to: ${value.lifecycle_stage}`,
          },
        });
      }
    }

    createActivityLog({
      action: `Updated asset: ${asset.name}`,
      target_type: "ASSET",
      target_id: asset.id,
    });

    return asset;
  } catch (error) {
    console.error(`[editAsset] Error:`, error);
    throw new Error("Failed to update asset with associated records");
  }
};

export const deleteAsset = async (id: number) => {
  const { user } = await getCurrentSession();
  if (!user) throw new Error("Not Authorized");
  try {
    await prisma.asset.delete({
      where: { id },
    });
    createActivityLog({
      action: `Deleted asset#${id}`,
      target_type: "ASSET",
      target_id: id,
    });
  } catch (error) {
    console.error(error);
    throw new Error("Asset is already associated to other data, cannot delete");
  }
};

export const getAllAssets = async () => {
  const { user } = await getCurrentSession();
  if (!user) throw new Error("Not Authorized");
  try {
    const assets = await prisma.asset.findMany({
      include: {
        type: {
          select: {
            model: true,
          },
        },
        locationHistory: {
          select: {
            id: true,
            assigned_date: true,
            release_date: true,
            location: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        maintenances: {
          select: {
            id: true,
            status: true,
            scheduled_date: true,
          },
        },
        checkInOuts: {
          select: {
            id: true,
            updated_at: true,
            status: true,
            user: {
              select: {
                username: true,
              },
            },
            employee: {
              select: {
                name: true,
              },
            },
          },
        },
        assetLifecycles: {
          select: {
            id: true,
            stage: true,
            change_date: true,
            notes: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });
    return assets;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch assets");
  }
};

export const getAssetById = async (id: number) => {
  const { user } = await getCurrentSession();
  if (!user) throw new Error("Not Authorized");
  try {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        type: {
          select: {
            model: true,
          },
        },
        locationHistory: {
          select: {
            id: true,
            assigned_date: true,
            release_date: true,
            location: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        },
        maintenances: {
          select: {
            id: true,
            status: true,
            scheduled_date: true,
          },
          orderBy: {
            created_at: "desc",
          },
        },
        checkInOuts: {
          select: {
            id: true,
            updated_at: true,
            status: true,
            user: {
              select: {
                username: true,
              },
            },
            employee: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
        },
        assetLifecycles: {
          select: {
            id: true,
            stage: true,
            change_date: true,
            notes: true,
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });
    return asset;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch asset");
  }
};

export const getAssetByType = async (type_id: number) => {
  const { user } = await getCurrentSession();
  if (!user) throw new Error("Not Authorized");
  try {
    const asset = await prisma.asset.findMany({
      where: { type_id },
      include: {
        type: true,
        locationHistory: {
          include: {
            location: true,
          },
        },
        maintenances: true,
        checkInOuts: {
          include: {
            user: true,
          },
        },
        assetLifecycles: true,
      },
    });
    return asset;
  } catch (error) {
    throw new Error("Failed to fetch asset");
  }
};

export const getAvailableAssets = async () => {
  const { user } = await getCurrentSession();
  if (!user) throw new Error("Not Authorized");
  try {
    const availableAssets = await prisma.asset.findMany({
      where: {
        status: "AKTIF",
        NOT: {
          checkInOuts: {
            some: {
              actual_return_date: null,
              status: "DIPINJAM",
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return availableAssets;
  } catch (error) {
    throw new Error("Failed to fetch asset");
  }
};

export const getAvailableAssetsIncludeId = async (id: number) => {
  const { user } = await getCurrentSession();
  if (!user) throw new Error("Not Authorized");
  try {
    const availableAssets = await prisma.asset.findMany({
      where: {
        OR: [
          {
            status: "AKTIF",
            NOT: {
              checkInOuts: {
                some: {
                  actual_return_date: null,
                  status: "DIPINJAM",
                },
              },
            },
          },
          {
            id,
          },
        ],
      },
      select: {
        id: true,
        name: true,
      },
    });

    return availableAssets;
  } catch (error) {
    throw new Error("Failed to fetch asset");
  }
};

export async function getAssetData() {
  const { user } = await getCurrentSession();
  if (!user) throw new Error("Not Authorized");
  const checkedOutAssets = await prisma.checkInOut.count({
    where: {
      status: "DIPINJAM",
    },
  });
  const returnedAssets = await prisma.checkInOut.count({
    where: {
      status: "DIKEMBALIKAN",
    },
  });

  return [
    {
      name: "Checked-Out",
      total: checkedOutAssets,
    },
    {
      name: "Returned",
      total: returnedAssets,
    },
  ];
}
