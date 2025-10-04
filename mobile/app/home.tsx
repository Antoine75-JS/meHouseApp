import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold">Home</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <Text className="text-xl font-semibold mb-2">Welcome!</Text>
          <Text className="text-gray-600">
            This is your home dashboard. You can manage your house tasks and
            settings here.
          </Text>
        </View>

        <View className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <Text className="text-lg font-semibold mb-4">Quick Actions</Text>
          <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mb-3">
            <Text className="text-white text-center font-semibold">
              View Tasks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-green-500 px-6 py-3 rounded-lg mb-3">
            <Text className="text-white text-center font-semibold">
              Add Task
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-purple-500 px-6 py-3 rounded-lg">
            <Text className="text-white text-center font-semibold">
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View className="bg-white px-6 py-4 border-t border-gray-200">
        <TouchableOpacity
          className="bg-gray-500 px-6 py-3 rounded-lg"
          onPress={() => router.push("/")}
        >
          <Text className="text-white text-center font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
