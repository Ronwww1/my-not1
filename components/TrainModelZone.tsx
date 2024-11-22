#давай изменим функции в точке FG
"use client";

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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm, SubmitHandler } from "react-hook-form";
import { FaFemale, FaImages, FaMale, FaRainbow } from "react-icons/fa";
import * as z from "zod";
import { fileUploadFormSchema } from "@/types/zod";
import { upload } from "@vercel/blob/client";

type FormInput = z.infer<typeof fileUploadFormSchema>;

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";

export default function TrainModelZone() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormInput>({
    resolver: zodResolver(fileUploadFormSchema),
    defaultValues: { name: "", type: "man" },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const uniqueFiles = acceptedFiles.filter(
        (file) => !files.some((f) => f.name === file.name)
      );

      if (files.length + uniqueFiles.length > 10) {
        return toast({
          title: "Too many images",
          description: "You can only upload up to 10 images.",
          duration: 5000,
        });
      }

      const totalSize = [...files, ...uniqueFiles].reduce(
        (acc, file) => acc + file.size,
        0
      );

      if (totalSize > 4.5 * 1024 * 1024) {
        return toast({
          title: "Size limit exceeded",
          description: "Total image size cannot exceed 4.5MB.",
          duration: 5000,
        });
      }

      setFiles((prev) => [...prev, ...uniqueFiles]);
      toast({ title: "Images selected", duration: 5000 });
    },
    [files, toast]
  );

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f.name !== file.name));
  };

  const trainModel = useCallback(async () => {
    setIsLoading(true);

    try {
      const blobUrls = await Promise.all(
        files.map((file) =>
          upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/astria/train-model/image-upload",
          }).then((blob) => blob.url)
        )
      );

      const payload = {
        urls: blobUrls,
        name: form.getValues("name").trim(),
        type: form.getValues("type"),
      };

      const response = await fetch("/astria/train-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const { message } = await response.json();
        toast({
          title: "Error",
          description: message.includes("Not enough credits") ? (
            <div>
              {message}
              <a href="/get-credits">
                <Button size="sm">Get Credits</Button>
              </a>
            </div>
          ) : (
            message
          ),
          duration: 5000,
        });
        return;
      }

      toast({
        title: "Model queued for training",
        description: "You will receive an email when it's ready.",
        duration: 5000,
      });
      router.push("/");
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Something went wrong.", duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [files, form, router, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
  });

  const modelType = form.watch("type");

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(trainModel)}
          className="flex flex-col gap-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormDescription>
                  Give your model a name for easy identification.
                </FormDescription>
                <FormControl>
                  <Input
                    placeholder="e.g. Natalie Headshots"
                    {...field}
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Type</FormLabel>
            <FormDescription>
              Select the type of headshots you want to generate.
            </FormDescription>
            <RadioGroup
              value={modelType}
              onValueChange={(value) => form.setValue("type", value)}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { value: "man", label: "Man", icon: FaMale },
                { value: "woman", label: "Woman", icon: FaFemale },
                { value: "person", label: "Unisex", icon: FaRainbow },
              ].map(({ value, label, icon: Icon }) => (
                <Label
                  key={value}
                  htmlFor={value}
                  className="flex flex-col items-center border-2 rounded-md p-4 hover:bg-accent peer-checked:border-primary"
                >
                  <RadioGroupItem
                    value={value}
                    id={value}
                    className="hidden"
                  />
                  <Icon className="mb-3 h-6 w-6" />
                  {label}
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div
            {...getRootProps()}
            className="border-dashed border-2 rounded-md p-4 cursor-pointer flex flex-col items-center"
          >
            <FormLabel>Samples</FormLabel>
            <FormDescription>
              Upload 4-10 images of the person for headshots.
            </FormDescription>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FaImages size={32} />
                <p>Drag and drop files here, or click to select.</p>
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {files.map((file) => (
                <div key={file.name} className="flex flex-col items-center gap-2">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-24 h-24 rounded-md object-cover"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(file)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button type="submit" isLoading={isLoading} className="w-full">
            Train Model {stripeIsConfigured && <span>(1 Credit)</span>}
          </Button>
        </form>
      </Form>
    </div>
  );
}
