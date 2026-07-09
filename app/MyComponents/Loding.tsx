import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function Loading (){
    return (
        <Button disabled>
            <Spinner data-icon="inline-start" />
            Loading...
        </Button>
    )
}
