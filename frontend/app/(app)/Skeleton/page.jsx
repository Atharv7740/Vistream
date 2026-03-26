import { cn } from "@/lib/utils";

function Skeleton({className="h-[400px] w-[300px] rounded-lg bg-black"} ) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
         
        />
    );
}

export default Skeleton ;