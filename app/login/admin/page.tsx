"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Form validation schema
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required." }),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      email: "", 
      password: "" 
    },
  });

  const handleSignIn = async (values: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("admin-credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.ok) {
        router.push("/dashboard/admin");
      } else {
        setError("Invalid admin credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderEmailField = () => (
    <FormField 
      control={form.control} 
      name="email" 
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input 
              placeholder="admin@setu.com" 
              type="email"
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderPasswordField = () => (
    <FormField 
      control={form.control} 
      name="password" 
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <Input 
              type="password" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderErrorMessage = () => {
    if (!error) return null;
    
    return (
      <p className="text-sm font-medium text-destructive">
        {error}
      </p>
    );
  };

  const renderSubmitButton = () => (
    <Button 
      type="submit" 
      disabled={loading} 
      className="w-full h-12 text-base font-medium"
    >
      {loading ? "Signing In..." : "Sign In"}
    </Button>
  );

  const renderLoginForm = () => (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSignIn)} 
        className="space-y-8"
      >
        {renderEmailField()}
        {renderPasswordField()}
        {renderErrorMessage()}
        {renderSubmitButton()}
      </form>
    </Form>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Administrator Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Government of India - Setu Medical Terminology Bridge
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            {renderLoginForm()}
          </CardContent>
        </Card>
        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}