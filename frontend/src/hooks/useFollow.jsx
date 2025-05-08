import { useMutation,useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast"

const useFollow = ()=>{

    const queryClient = useQueryClient();
    const {mutate:follow, isPending} = useMutation({
        mutationFn: async(userId) =>{
            try {
                const res = await fetch(`/api/users/follow/${userId}`,{
                    method:"POST",
                });
                const data = await res.json();
                if(!res.ok) throw new Error(data.error || "something went wrong");
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        onSuccess : () =>{
            // two refetching
            // promise will make them work simulatenouslty hence increasing speed
            Promise.all([
                queryClient.invalidateQueries({queryKey: ["suggestedUsers"]}),

                queryClient.invalidateQueries({queryKey: ["authUser"]}),
            ])
           
        },
        onError: () =>{
            toast.error("Something went wrong");
        }
    })    
    return {follow,isPending};
}


export default useFollow;