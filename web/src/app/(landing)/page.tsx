"use client";

import { FC } from "react";
import Link from "next/link";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

interface CardProps {
  route: string;
  content: string;
  action: string;
}
const CardItem: FC<CardProps> = ({ route, content, action }) => {
  return (
    <Card variant="outlined" sx={{ minWidth: 275 }}>
      <CardContent>{content}</CardContent>
      <CardActions className="flex justify-end">
        <Button size="small">
          <Link href={route}>{action}</Link>
        </Button>
      </CardActions>
    </Card>
  );
};

export default function LandingPage() {
  return (
    <section className="flex justify-center items-center bg-slate-50 min-h-screen">
      <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem]">
        <CardItem
          route="/upload"
          content="Upload a csv file with user information"
          action="Upload"
        />
        <CardItem
          route="/dashboard"
          content="View details of all users in a dashboard"
          action="Dashboard"
        />
      </div>
    </section>
  );
}
