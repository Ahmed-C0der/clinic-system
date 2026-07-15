import { getDoctorPatients } from "@/app/(Front_End)/actions/doctor";
import PatientClient from "@/app/(Front_End)/(doctorProtal)/doctor-dashboard/patients/patientClient";

export default async function Patients({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {

    let patientsData: Awaited<ReturnType<typeof getDoctorPatients>> | null = null;

    const MySearchParams = await searchParams;
    const take = Number(MySearchParams?.take) || 5;
    const page = Number(MySearchParams?.page) || 1;
    const skip = (page - 1) * take;

    try {
        patientsData = await getDoctorPatients({ take, skip, page });
    } catch (error) {
        console.log(error);
    }

    return (
        <div>
            {/* التحقق من نجاح العملية ووجود البيانات لتجنب تمرير undefined */}
            {patientsData?.success && patientsData.data ? (
                <PatientClient data={patientsData.data} />
            ) : (
                <div>
                    <p>{patientsData?.message}</p>
                </div>
            )}
        </div>
    );
}