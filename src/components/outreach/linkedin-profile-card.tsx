import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Users,
  Link as LinkIcon,
  Star,
  Crown,
} from "lucide-react"
import type { LinkedInProfile } from "@/types"

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "0"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

interface LinkedInProfileCardProps {
  profile: LinkedInProfile
}

export function LinkedInProfileCard({ profile }: LinkedInProfileCardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const overview = profile.overview?.data
  const details = profile.details?.data
  const experienceData = profile.experience?.data?.experience ?? []
  const educationData = profile.education?.data?.education ?? details?.education ?? []
  const skillsData = profile.skills?.data?.skills ?? []
  const languages = details?.languages?.languages ?? []

  if (!overview) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            No data available for @{profile.username}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 sm:p-6 pb-3">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 shrink-0">
              <AvatarImage
                src={overview.profilePictureURL}
                alt={overview.fullName}
              />
              <AvatarFallback className="text-lg">
                {overview.firstName?.[0]}
                {overview.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg truncate">
                  {overview.fullName}
                </h3>
                {overview.isTopVoice && (
                  <Badge variant="default" className="text-xs gap-1">
                    <Star className="h-3 w-3" />
                    Top Voice
                  </Badge>
                )}
                {overview.premium && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Crown className="h-3 w-3" />
                    Premium
                  </Badge>
                )}
                {overview.influencer && (
                  <Badge className="text-xs bg-blue-500/10 text-blue-700">
                    Influencer
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {overview.headline}
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {formatNumber(overview.followerCount)} followers
                </span>
                <span className="flex items-center gap-1">
                  <LinkIcon className="h-3.5 w-3.5" />
                  {formatNumber(overview.connectionsCount)} connections
                </span>
              </div>

              {overview.CurrentPositions?.length > 0 && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {overview.CurrentPositions.map((pos) => (
                    <div
                      key={pos.id}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      {pos.logoURL && (
                        <img
                          src={pos.logoURL}
                          alt={pos.name}
                          className="h-4 w-4 rounded"
                        />
                      )}
                      <span className="text-muted-foreground">{pos.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabbed content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 sm:px-6">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1 text-xs">
                About
              </TabsTrigger>
              <TabsTrigger value="experience" className="flex-1 text-xs">
                Experience
              </TabsTrigger>
              <TabsTrigger value="education" className="flex-1 text-xs">
                Education
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex-1 text-xs">
                Skills
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-6 pt-3">
            <TabsContent value="overview" className="mt-0">
              <div className="space-y-4">
                {details?.about && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">
                      About
                    </h4>
                    <p className="text-sm leading-relaxed">{details.about}</p>
                  </div>
                )}

                {languages.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1.5">
                      Languages
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {languages.map((lang) => (
                        <Badge
                          key={lang.Language}
                          variant="outline"
                          className="text-xs gap-1"
                        >
                          <Globe className="h-3 w-3" />
                          {lang.Language}
                          {lang.Level && (
                            <span className="text-muted-foreground">
                              ({lang.Level})
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="experience" className="mt-0">
              {experienceData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No experience data available
                </p>
              ) : (
                <div className="space-y-4">
                  {experienceData.map((exp, i) => (
                    <div key={i} className="flex gap-3">
                      {exp.companyLogo ? (
                        <img
                          src={exp.companyLogo}
                          alt={exp.companyName}
                          className="h-10 w-10 rounded shrink-0 bg-surface-2"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-surface-2 flex items-center justify-center shrink-0">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{exp.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {exp.companyName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exp.totalDuration}
                        </p>
                        {exp.positions?.map((pos, j) => (
                          <div
                            key={j}
                            className="mt-2 pl-3 border-l-2 border-border"
                          >
                            <p className="text-xs font-medium">{pos.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {pos.location} · {pos.duration}
                            </p>
                            {pos.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                                {pos.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="education" className="mt-0">
              {educationData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No education data available
                </p>
              ) : (
                <div className="space-y-3">
                  {educationData.map((edu, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-10 w-10 rounded bg-surface-2 flex items-center justify-center shrink-0">
                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{edu.university}</p>
                        <p className="text-xs text-muted-foreground">
                          {edu.degree}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {edu.duration}
                        </p>
                        {edu.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="skills" className="mt-0">
              {skillsData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No skills data available
                </p>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {skillsData.map((skill) => (
                    <Badge
                      key={skill.skillName}
                      variant={
                        skill.isPassedLinkedInSkillAssessment
                          ? "default"
                          : "outline"
                      }
                      className="text-xs gap-1"
                    >
                      {skill.isPassedLinkedInSkillAssessment && (
                        <Award className="h-3 w-3" />
                      )}
                      {skill.skillName}
                      {skill.endorsementsCount > 0 && (
                        <span className="text-muted-foreground ml-0.5">
                          ({skill.endorsementsCount})
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
