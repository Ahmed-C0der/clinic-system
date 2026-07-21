import { getDoctorRecords } from "@/app/(Front_End)/actions/doctor";
import RecordsClient from "./recordsClient";

export default async function RecordsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const MySearchParams = await searchParams;
    const take = Number(MySearchParams?.take) || 10;
    const page = Number(MySearchParams?.page) || 1;
    const skip = (page - 1) * take;

    let recordsData: Awaited<ReturnType<typeof getDoctorRecords>> | null = null;
    try {
        recordsData = await getDoctorRecords({ take, skip, page });
    } catch (error) {
        console.log(error);
    }

    return (
        <div className="p-6">
            {recordsData?.success && recordsData.data ? (
                <RecordsClient data={recordsData.data} />
            ) : (
                <div className="text-center text-on-surface/60 py-10">
                    <p>{recordsData?.message}</p>
                </div>
            )}
        </div>
    )
}
