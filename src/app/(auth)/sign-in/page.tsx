"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useDebounceValue } from "usehooks-ts";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useRouter, useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";

import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/apiResponse";
const page = () => {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckigUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedUsername = useDebounceValue(username, 300);
  const { toast } = useToast();
  const useRouter = useRouter();

  // zod impletation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const userCheckUniqueUsername = async () => {
      if (debouncedUsername) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const res = await axios.get(
            `/api/check-username?username=${debouncedUsername}`
          );

          setUsernameMessage(res?.data?.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data?.message ?? "Error Checking Username"
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    userCheckUniqueUsername();
  }, [debouncedUsername]);

  return <div>page</div>;
};

export default page;
