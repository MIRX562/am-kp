"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { editAssetTypeSchema } from "@/schemas/asset-type-schema";
import { AssetType } from "@prisma/client";
import { editAssetType } from "@/actions/asset-type-actions";
import { useRouter } from "next/navigation";

interface MyFormProps {
  data: AssetType;
}

export default function EditAssetTypeForm({ data }: MyFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof editAssetTypeSchema>>({
    resolver: zodResolver(editAssetTypeSchema),
    defaultValues: data,
  });

  async function onSubmit(data: z.infer<typeof editAssetTypeSchema>) {
    try {
      await toast.promise(editAssetType(data), {
        loading: "Updating asset type...",
        success: "asset type updated successfully!",
        error: (err) => err.message || "Failed to update asset type",
      });
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input placeholder="macbook air 2017" type="" {...field} />
              </FormControl>
              <FormDescription>Model/series of the item</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="manufacturer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manufacturer</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" type="" {...field} />
              </FormControl>
              <FormDescription>
                The company that b=make the item
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="Laptop, Phone, etc." type="" {...field} />
              </FormControl>
              <FormDescription>Category of the item</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="usage scope, terms, etc.."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Additional info about the item</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
