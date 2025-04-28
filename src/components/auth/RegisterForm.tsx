import { useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { isEmailUnique } from "../../lib/validate";
import { supabase } from "../../lib/supabase";
import Image from "next/image";

const RegisterForm = () => {
  const { handleRegister } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"admin" | "user" | "courier">("user");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setImageUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailUnique = await isEmailUnique(email);
    if (!emailUnique) {
      setError("Email is already in use.");
      return;
    }

    let imageUrlToSend = "";
    if (image) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, image);
      console.log(`Image uploaded to: ${data?.path}`);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        setError("Error uploading image. Please try again.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      imageUrlToSend = publicUrlData?.publicUrl || "";
    }

    const success = await handleRegister({
      name,
      phone,
      role,
      address,
      email,
      password,
      profileImage: imageUrlToSend,
    });

    if (success) {
      router.push("/dashboard");
    } else {
      setError("Registration failed. Please try again.");
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-black">
        Register
      </h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full mb-4 p-2 border border-gray-300 rounded-md text-black placeholder-black"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full mb-4 p-2 border border-gray-300 rounded-md text-black placeholder-black"
      />
      <input
        type="text"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        className="w-full mb-4 p-2 border border-gray-300 rounded-md text-black placeholder-black"
      />
      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
        className="w-full mb-4 p-2 border border-gray-300 rounded-md text-black placeholder-black"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full mb-6 p-2 border border-gray-300 rounded-md text-black placeholder-black"
      />

      <select
        value={role}
        onChange={(e) =>
          setRole(e.target.value as "admin" | "user" | "courier")
        }
        className="w-full mb-4 p-2 border border-gray-300 rounded-md text-black"
      >
        <option value="user">User</option>
        <option value="courier">Courier</option>
        <option value="admin">Admin</option>
      </select>

      <label htmlFor="file-upload" className="mb-4">
        <button
          type="button"
          className="mb-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          onClick={handleButtonClick}
        >
          Upload Image
        </button>
        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {imageUrl && (
        <div className="mb-4">
          <Image
            src={imageUrl}
            alt="Preview"
            width={128}
            height={128}
            className="object-cover rounded-md"
            style={{ width: "auto", height: "auto" }}
          />
        </div>
      )}

      <button
        type="submit"
        className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Register
      </button>
    </form>
  );
};

export default RegisterForm;
