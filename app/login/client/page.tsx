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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Form validation schema
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type FormData = z.infer<typeof formSchema>;

export default function ClientLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignIn = async (values: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("client-credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.ok) {
        router.push("/dashboard/client");
      } else {
        setError("Invalid email or password. Please try again.");
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
              placeholder="name@example.com" 
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
              placeholder="********" 
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

  const renderSignUpLink = () => (
    <div className="mt-4 text-center text-sm">
      Don't have an account?{" "}
      <Link href="/signup/client" className="underline">
        Sign up
      </Link>
    </div>
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
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Client Login</CardTitle>
        </CardHeader>
        <CardContent>
          {renderLoginForm()}
          {renderSignUpLink()}
        </CardContent>
      </Card>
    </div>
  );
}