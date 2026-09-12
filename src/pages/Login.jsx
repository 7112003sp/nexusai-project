import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();

  const [state, setState] = React.useState("login");

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
  });

  const { axios, settokken } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
  console.log("Button clicked");
    const url =
      state === "login"
        ? "/api/user/login"
        : "/api/user/register";

    try {
      const { data } = await axios.post(url, {
        name: formData.name,
        email: formData.email,
        psw: formData.password,
      });

      if (data.success) {
        settokken(data.token);
        localStorage.setItem("token", data.token);

        toast.success(
          state === "login"
            ? "Login successful"
            : "Registration successful"
        );

        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center dark:bg-linear-to-b from-[#242124] to-[#000000] dark:text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="sm:w-[350px] w-full text-center bg-gray-900 border border-gray-800 rounded-2xl px-8"
      >
        <h1 className="text-white text-3xl mt-10 font-medium">
          {state === "login" ? "Login" : "Sign Up"}
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          Please sign in to continue
        </p>

        {state !== "login" && (
          <div className="flex items-center mt-6 w-full bg-gray-800 border border-gray-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="flex items-center w-full mt-4 bg-gray-800 border border-gray-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center mt-4 w-full bg-gray-800 border border-gray-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mt-4 text-left">
          <button
            type="button"
            className="text-sm text-indigo-400 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="mt-2 w-full h-11 rounded-full text-white bg-indigo-600 hover:bg-indigo-500 transition"
        >
          {state === "login" ? "Login" : "Sign Up"}
        </button>

        <p
          onClick={() =>
            setState((prev) => (prev === "login" ? "register" : "login"))
          }
          className="text-gray-400 text-sm mt-3 mb-11 cursor-pointer"
        >
          {state === "login"
            ? "Don't have an account?"
            : "Already have an account?"}
          <span className="text-indigo-400 hover:underline ml-1">
            Click here
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;