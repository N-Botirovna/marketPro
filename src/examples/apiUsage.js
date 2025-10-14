// Example usage of API response handlers

import { handleUserProfileResponse, handleBooksListResponse } from '@/utils/apiResponse';
import { getBooks, getUserPostedBooks } from '@/services/books';

// Example: Handle user profile API response
export function handleUserProfileExample() {
  // This is what you get from /me endpoint
  const userProfileResponse = {
    data: {
      "id": 9,
      "bio": null,
      "app_phone_number": null,
      "role": "simple",
      "first_name": "Nargiza",
      "last_name": "",
      "picture": "http://api.kitobzor.uz/media/users/pictures/default_user.png",
      "region": null,
      "district": null,
      "point": null,
      "location_text": null,
      "user_type": "bookshop"
    }
  };

  // Process the response
  const userData = handleUserProfileResponse(userProfileResponse);
  
  console.log('Processed user data:', userData);
  // Output:
  // {
  //   id: 9,
  //   first_name: "Nargiza",
  //   last_name: "",
  //   app_phone_number: null,
  //   bio: null,
  //   role: "simple",
  //   picture: "http://api.kitobzor.uz/media/users/pictures/default_user.png",
  //   region: null,
  //   district: null,
  //   point: null,
  //   location_text: null,
  //   user_type: "bookshop",
  //   raw: { ... original response ... }
  // }

  return userData;
}

// Example: Handle books list API response
export async function handleBooksListExample() {
  try {
    // Get books using the service
    const booksResponse = await getBooks({ limit: 10 });
    
    console.log('Books response:', booksResponse);
    // Output structure:
    // {
    //   books: [...], // Array of book objects
    //   count: 150,   // Total number of books
    //   next: "http://api.kitobzor.uz/books/?page=2",
    //   previous: null,
    //   success: true,
    //   total_pages: 15,
    //   current_page: 1,
    //   has_next: true,
    //   has_previous: false,
    //   raw: { ... original response ... }
    // }

    return booksResponse;
  } catch (error) {
    console.error('Error fetching books:', error);
    return null;
  }
}

// Example: Get user's posted books
export async function handleUserBooksExample(userId) {
  try {
    const userBooksResponse = await getUserPostedBooks(userId, 6);
    
    console.log('User books:', userBooksResponse);
    // Same structure as books list but filtered for specific user
    
    return userBooksResponse;
  } catch (error) {
    console.error('Error fetching user books:', error);
    return null;
  }
}

// Example: Using in React component
export function useUserProfile(userId) {
  const [userData, setUserData] = useState(null);
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile (you would call your auth service here)
        // const profileResponse = await authService.getMe();
        // const processedProfile = handleUserProfileResponse(profileResponse);
        // setUserData(processedProfile);
        
        // Fetch user's books
        const booksResponse = await getUserPostedBooks(userId, 6);
        setUserBooks(booksResponse.books || []);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  return { userData, userBooks, loading };
}
