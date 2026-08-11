import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  CalendarHeart,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import { Route } from "@/routes/_authenticated/profile/index";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function ProfilePage() {
  const profile = Route.useLoaderData();

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          View your personal information, employment details, and leave
          balances.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Leave Balance & Employment Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-primary text-primary-foreground border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarHeart className="w-5 h-5" />
                Leave Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">{profile.leave_days}</div>
              <p className="text-primary-foreground/80 mt-2 text-sm">
                Days remaining this year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-sm text-muted-foreground uppercase">
                    {profile.department || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <span className="mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground capitalize">
                    {profile.role.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Joined</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(profile.created_at), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Personal Information */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>
                Your personal details as registered in the system. Contact HR to
                update.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Full Name
                  </p>
                  <p className="text-base">{profile.name}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address
                  </p>
                  <p className="text-base">{profile.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Phone Number
                  </p>
                  <p className="text-base">{profile.phone_number}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
