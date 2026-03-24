import { Card, Button, HR } from "flowbite-react";
import {
  ImEnter,
  ImExit,
  ImStopwatch,
  ImSpinner11,
  ImUserMinus,
  ImHourGlass,
  ImHistory,
  ImCalendar,
  ImClock,
} from "react-icons/im";
import { format, parse } from "date-fns";
import EditButton from "./edit";
import AddButton from "./add";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Duty Timings",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  let departments = [];
  let dutyTimings = [];

  try {
    const [depRes, timingRes] = await Promise.all([
      fetchWithCookies(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/department/get`
      ).catch((error) => {
        if (error.message === "Unauthorized") {
          redirect("/auth/admin");
        }
        console.log(error);
      }),
      fetchWithCookies(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/duty-timing/get`
      ).catch((error) => {
        if (error.message === "Unauthorized") {
          redirect("/auth/admin");
        }
        console.log(error);
      }),
    ]);

    departments = depRes?.data || [];
    dutyTimings = timingRes?.data || [];
  } catch (error) {
    console.error(error);
  }

  const merged = departments?.map((dept) => {
    const timing = dutyTimings?.find((t) => t.department === dept._id) || null;
    return { ...dept, timing };
  });

  return (
    <div className="lg:p-4 space-y-6">
      {merged.map((dept) => {
        const timing = dept.timing;

        return (
          <Card key={dept._id}>
            <h5 className="text-xl font-bold text-gray-900 dark:text-white">
              Duty Timings: {dept.name}
            </h5>

            {!timing ? (
              <div className="flex justify-center py-6">
                <AddButton departmentId={dept._id} />
              </div>
            ) : (
              <>
                {/* Timings */}
                <div className="flex flex-col md:flex-row gap-6 md:items-end">
                  {/* First Half */}
                  <div>
                    <h3 className="text-lg mb-2 font-semibold">First Half</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button as="div" size="xl" gradientDuoTone="purpleToBlue">
                        <ImEnter className="mr-2 h-5 w-5" />
                        Entry Time:{" "}
                        {timing.startTime &&
                          format(
                            parse(timing.startTime, "HH:mm", new Date()),
                            "hh:mm a"
                          )}
                      </Button>
                      <Button as="div" size="xl" gradientDuoTone="greenToBlue">
                        <ImStopwatch className="mr-2 h-5 w-5" />
                        Break Time:{" "}
                        {timing.firstHalfEnd &&
                          format(
                            parse(timing.firstHalfEnd, "HH:mm", new Date()),
                            "hh:mm a"
                          )}
                      </Button>
                    </div>
                  </div>

                  {/* Second Half */}
                  <div>
                    <h3 className="text-lg mb-2 font-semibold">Second Half</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button as="div" size="xl" gradientDuoTone="cyanToBlue">
                        <ImSpinner11 className="mr-2 h-5 w-5" />
                        Start Time:{" "}
                        {timing.secondHalfStart &&
                          format(
                            parse(timing.secondHalfStart, "HH:mm", new Date()),
                            "hh:mm a"
                          )}
                      </Button>
                      <Button as="div" size="xl" gradientDuoTone="pinkToOrange">
                        <ImExit className="mr-2 h-5 w-5" />
                        Exit Time:{" "}
                        {timing.endTime &&
                          format(
                            parse(timing.endTime, "HH:mm", new Date()),
                            "hh:mm a"
                          )}
                      </Button>
                    </div>
                  </div>

                  <EditButton data={timing} />
                </div>

                <HR />

                {/* Settings */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-wrap sm:flex-row gap-2">
                    <Button
                      as="div"
                      size="xl"
                      gradientDuoTone="pinkToOrange"
                      outline
                    >
                      <ImUserMinus className="mr-2 h-5 w-5" />
                      Allowed Half-day: {timing.halfDayAllowed}
                    </Button>
                    <Button
                      as="div"
                      size="xl"
                      gradientDuoTone="redToYellow"
                      outline
                    >
                      <ImHourGlass className="mr-2 h-5 w-5" />
                      Allowed Late-entry: {timing.lateAllowed}
                    </Button>
                    <Button
                      as="div"
                      size="xl"
                      gradientDuoTone="redToYellow"
                      outline
                    >
                      <ImClock className="mr-2 h-5 w-5" />
                      Late-entry Time: {timing.lateEntryTime} minutes
                    </Button>
                    <Button
                      as="div"
                      size="xl"
                      gradientDuoTone="purpleToPink"
                      outline
                    >
                      <ImCalendar className="mr-2 h-5 w-5" />
                      Default PL: {timing.paidLeave}
                    </Button>
                  </div>

                  <div className="mt-3">
                    <Button as="div" size="xl" color="dark" outline>
                      <ImHistory className="mr-2 h-5 w-5" />
                      Last Updated:{" "}
                      {timing.updatedAt &&
                        format(
                          new Date(timing.updatedAt),
                          "dd-MM-yyyy hh:mm:ss a"
                        )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
}
