import { useQuery } from "@tanstack/react-query";
import { usersService } from "./users.service";
import { useAuth } from "@/features/auth/context/AuthContext";

export const useUserProfile = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["userProfile", "me"],
    queryFn: usersService.getCurrentUserProfile,
    // Only fetch if the user is actually authenticated
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // Cache the profile for 5 minutes
  });
};
