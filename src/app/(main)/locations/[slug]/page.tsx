import { DataTable } from "@/components/table/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
  CalendarIcon,
  PackageIcon,
  BuildingIcon,
  FileTextIcon,
} from "lucide-react";
import { assetColumns } from "../../assets/_components/collumn";
import { getLocationById } from "@/actions/location-actions";
import {
  assetLocationHistoryColumns,
  simplifiedInventoryColumns,
} from "./_components/collumn";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const slug = await params.slug;
  const id = parseInt(searchParams.id);

  const data = await getLocationById(id);

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">{decodeURI(slug)}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
            <BuildingIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.name}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location Type</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.type}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created At</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDate(data.created_at.toLocaleString())}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Address</CardTitle>
          <FileTextIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p>{data.address}</p>
        </CardContent>
      </Card>
      <div>
        <h1 className="text-xl font-bold mb-2">Linked Items</h1>
        <Tabs defaultValue="asset">
          <TabsList>
            <TabsTrigger value="asset">Asset</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>
          <TabsContent value="asset">
            <DataTable
              columns={assetLocationHistoryColumns}
              data={data.locationHistory}
            />
          </TabsContent>
          <TabsContent value="inventory">
            <DataTable
              columns={simplifiedInventoryColumns}
              data={data.inventories}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}