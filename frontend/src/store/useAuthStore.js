import {create} from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import {io} from "socket.io-client";

const BASE_URL = "http://localhost:3000";

export const useAuthStore = create(
    (set, get) => ({
        authUser: null,
        isSigningUP: false,
        isLoggingIn: false,
        iSUpdatingProfile: false,
        isCheckingAuth: true,
        onlineUsers: [],
        socket: null,
        checkAuth: async() => {
            try{
                const res = await axiosInstance.get("/auth/check");

                set({authUser: res.data});
            }catch(error){
                set({authUser: null});
                console.log("error in checkAuth", error);
            }finally{
                set({isCheckingAuth: false});
            }
        },
        signup: async (data) => {
            set({isSigningUP: true});
            try{
                const res = await axiosInstance.post("/auth/signup", data);
                set({authUser: res.data});
                toast.success("Account created successfully!");
            }catch(error){
                toast.error(error.response.data.message);
                console.log("error in signup", error);
            }finally{
                set({isSigningUP: false});
            }
        },
        login: async(data) => {
            set({ isLoggingIn: true });
            try {
                const res = await axiosInstance.post("/auth/login", data);
                set({ authUser: res.data });
                toast.success("Logged in successfully");
                get().connectSocket();
            } catch (error) {
                toast.error(error.response.data.message);
            } finally {
                set({ isLoggingIn: false });
            }
        },
        logout: async(data) => {
            try{
                await axiosInstance.post("/auth/logout");
                set({authUser: null});
                toast.success("Logged out successfully!");
                get().disconnectSocket();
            }catch(error){
                console.log("error in logout", error);
                toast.error(error.response.data.message);   
            }
        },
        updateProfile: async (data) => {
            set({ isUpdatingProfile: true });
            try {
              const res = await axiosInstance.put("/auth/update-profile", data);
              set({ authUser: res.data });
              toast.success("Profile updated successfully");
            } catch (error) {
              console.log("error in update profile:", error);
              toast.error("Update unsuccessful");
            } finally {
              set({ isUpdatingProfile: false });
            }

        },
        connectSocket : () => {
            const {authUser} = get();
            if(!authUser || get.socket?.connected) return;
            const socket = io(BASE_URL, {
                query: {
                    userId: authUser._id,
                }
            });
            socket.connect();
            set({socket:socket});

            socket.on("getOnlineUsers", (userIds) => {
                set({onlineUsers: userIds});
            })
        },
        disconnectSocket : ()=>{
            if(get().socket?.connected)  get().socket?.disconnect();
        }
    })
);