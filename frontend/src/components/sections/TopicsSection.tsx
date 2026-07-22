import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TopicSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Topics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-4 gap-2">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </CardContent>
    </Card>
  );
}
