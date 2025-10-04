import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white items-center justify-center p-5">
      <Text className="text-3xl font-bold mb-8">MeHouse</Text>
      <Text className="text-lg mb-8 text-center text-gray-600">
        Welcome to your house management app
      </Text>

      <TouchableOpacity
        className="bg-blue-500 px-8 py-4 rounded-lg mb-4 w-48"
        onPress={() => router.push("/login")}
      >
        <Text className="text-white text-center text-lg font-semibold">
          Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-gray-500 px-8 py-4 rounded-lg w-48"
        onPress={() => router.push("/home")}
      >
        <Text className="text-white text-center text-lg font-semibold">
          Go to Home
        </Text>
      </TouchableOpacity>
    </View>
  );
}
