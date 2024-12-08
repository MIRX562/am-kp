"use server";
import prisma from "@/lib/db";

// Create a MaintenanceInventory record
export async function createMaintenanceInventory(data: {
  maintenance_id: number;
  inventory_id: number;
  quantity_used: number;
}) {
  try {
    return await prisma.maintenanceInventory.create({ data });
  } catch (error) {
    console.error("[createMaintenanceInventory] Failed to create MaintenanceInventory record:", error);
    throw new Error("Unable to create MaintenanceInventory record. Please try again.");
  }
}

// Get all MaintenanceInventory records
export async function getAllMaintenanceInventories() {
  try {
    return await prisma.maintenanceInventory.findMany({
      include: {
        maintenance: {
          include: {
            asset: true,
            mechanic: true,
          },
        },
        inventory: true,
      },
    });
  } catch (error) {
    console.error("[getAllMaintenanceInventories] Failed to fetch MaintenanceInventory records:", error);
    throw new Error("Unable to fetch MaintenanceInventory records. Please try again.");
  }
}

// Get MaintenanceInventory record by ID
export async function getMaintenanceInventoryById(
  maintenance_inventory_id: number
) {
  try {
    const record = await prisma.maintenanceInventory.findUnique({
      where: { maintenance_inventory_id },
      include: {
        maintenance: {
          include: {
            asset: true,
            mechanic: true,
          },
        },
        inventory: true,
      },
    });
    if (!record) {
      throw new Error(`MaintenanceInventory record with ID ${maintenance_inventory_id} not found.`);
    }
    return record;
  } catch (error) {
    console.error(`[getMaintenanceInventoryById] Failed to fetch MaintenanceInventory record with ID ${maintenance_inventory_id}:`, error);
    throw new Error("Unable to fetch the specified MaintenanceInventory record. Please try again.");
  }
}

// Get MaintenanceInventory records by Maintenance ID
export async function getMaintenanceInventoriesByMaintenanceId(
  maintenance_id: number
) {
  try {
    return await prisma.maintenanceInventory.findMany({
      where: { maintenance_id },
      include: {
        maintenance: {
          include: {
            asset: true,
            mechanic: true,
          },
        },
        inventory: true,
      },
    });
  } catch (error) {
    console.error(`[getMaintenanceInventoriesByMaintenanceId] Failed to fetch MaintenanceInventory records for Maintenance ID ${maintenance_id}:`, error);
    throw new Error("Unable to fetch MaintenanceInventory records for the specified Maintenance ID. Please try again.");
  }
}

// Get MaintenanceInventory records by Inventory ID
export async function getMaintenanceInventoriesByInventoryId(
  inventory_id: number
) {
  try {
    return await prisma.maintenanceInventory.findMany({
      where: { inventory_id },
      include: {
        maintenance: {
          include: {
            asset: true,
            mechanic: true,
          },
        },
        inventory: true,
      },
    });
  } catch (error) {
    console.error(`[getMaintenanceInventoriesByInventoryId] Failed to fetch MaintenanceInventory records for Inventory ID ${inventory_id}:`, error);
    throw new Error("Unable to fetch MaintenanceInventory records for the specified Inventory ID. Please try again.");
  }
}

// Update a MaintenanceInventory record
export async function updateMaintenanceInventory(
  maintenance_inventory_id: number,
  data: {
    maintenance_id?: number;
    inventory_id?: number;
    quantity_used?: number;
  }
) {
  try {
    return await prisma.maintenanceInventory.update({
      where: { maintenance_inventory_id },
      data,
    });
  } catch (error) {
    console.error(`[updateMaintenanceInventory] Failed to update MaintenanceInventory record with ID ${maintenance_inventory_id}:`, error);
    throw new Error("Unable to update the MaintenanceInventory record. Please try again.");
  }
}

// Delete a MaintenanceInventory record
export async function deleteMaintenanceInventory(
  maintenance_inventory_id: number
) {
  try {
    return await prisma.maintenanceInventory.delete({
      where: { maintenance_inventory_id },
    });
  } catch (error) {
    console.error(`[deleteMaintenanceInventory] Failed to delete MaintenanceInventory record with ID ${maintenance_inventory_id}:`, error);
    throw new Error("Unable to delete the MaintenanceInventory record. Please try again.");
  }
}

// Get total inventory usage for a specific maintenance
export async function getTotalInventoryUsageByMaintenance(
  maintenance_id: number
) {
  try {
    const result = await prisma.maintenanceInventory.aggregate({
      where: { maintenance_id },
      _sum: { quantity_used: true },
    });
    return result._sum.quantity_used || 0;
  } catch (error) {
    console.error(`[getTotalInventoryUsageByMaintenance] Failed to calculate total inventory usage for Maintenance ID ${maintenance_id}:`, error);
    throw new Error("Unable to calculate total inventory usage for the specified maintenance. Please try again.");
  }
}

// Get total inventory usage for a specific inventory
export async function getTotalUsageByInventory(inventory_id: number) {
  try {
    const result = await prisma.maintenanceInventory.aggregate({
      where: { inventory_id },
      _sum: { quantity_used: true },
    });
    return result._sum.quantity_used || 0;
  } catch (error) {
    console.error(`[getTotalUsageByInventory] Failed to calculate total inventory usage for Inventory ID ${inventory_id}:`, error);
    throw new Error("Unable to calculate total inventory usage for the specified inventory. Please try again.");
  }
}