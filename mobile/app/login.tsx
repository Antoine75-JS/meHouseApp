import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log("Login attempt:", { email, password });
    router.push("/home");
  };

  return (
    <View className="flex-1 bg-white items-center justify-center p-8">
      <Text className="text-3xl font-bold mb-8">Login</Text>

      <TextInput
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className="bg-blue-500 px-8 py-4 rounded-lg w-full mb-4"
        onPress={handleLogin}
      >
        <Text className="text-white text-center text-lg font-semibold">
          Sign In
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text className="text-blue-500 text-center">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}
