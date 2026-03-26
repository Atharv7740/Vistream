"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ENDPOINT } from "@/lib/api.client";
import { setLoginDetails } from "@/redux/userSlice";
import { LucideLoader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState,useEffect} from "react"; 
import { useDispatch, useSelector } from "react-redux";
// import { FcGoogle } from "react-icons/fc";

function Login() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(""); 
  
  const router = useRouter();
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (userData.isLoggedIn) {
      router.push("/");
    }
  }, [userData.isLoggedIn, router]);

  async function onSubmit() {
    setError(""); 
    
    try {
      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }
      
      setLoading(true);
      const response = await api.post(ENDPOINT.login, {
        email,
        password,
      });

      
      if (response.status === 200) { 
        dispatch(setLoginDetails(response.data.user));
        router.push("/");
      } 
      
     

    } catch (err) {
      console.error("Login Error:", err);
      
      const apiErrorMessage = err.response?.data?.message || "Invalid credentials or connection error.";
      setError(apiErrorMessage);
    } finally {
      setLoading(false);
    }
  }

  
  return (
    <Card className="bg-white text-black h-[50vh] w-[30vw] min-w-fit sm:h-[60vh] p-6 flex flex-col gap-8 shadow-lg rounded-4xl border border-zinc-800">
      
      {/* Header */}
      <CardHeader className="p-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-semibold">ViStream</CardTitle>
          <Button
            variant="link"
            className="text-zinc-400 hover:text-black "
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </Button>
        </div>
        <CardDescription className="text-zinc-400">
          Login with your credentials
        </CardDescription>
      </CardHeader>

      {/* Form */}
      <CardContent className="flex flex-col gap-4 p-0">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            className="mt-1 bg-white border-zinc-700 text-black"
            type="email"
            id="email"
            placeholder="user@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>

        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Button
              variant="link"
              className="text-zinc-400 hover:text-black p-0"
              // Assuming this navigates to a password reset page
              onClick={() => router.push("/forgot-password")}
            >
              Forgot Password?
            </Button>
          </div>
          <Input
            className="mt-1 bg-white border-zinc-700 text-black card-hover-effect"
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex flex-col gap-3 p-0">
        
        {/* Error Message Display */}
        {error && <p className="text-red-500 text-sm text-center -mt-2">{error}</p>} 
        
        <Button
          variant="outline"
          className="bg-white text-black hover:bg-zinc-200 w-full"
          onClick={onSubmit}
          disabled={loading} // 👈 Disabled while loading
        >
          Login{" "}
          {loading && <LucideLoader2 className="animate-spin ml-2 w-4 h-4" />}
        </Button>

        <Button
          variant="outline"
          className="bg-black text-white border-zinc-600 hover:bg-zinc-800 hover:text-white flex items-center justify-center gap-2 w-full"
        >
          {/* Assuming you will uncomment and use FcGoogle icon here */}
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  );
}

export default Login;