import { Heading } from "@components/lib/typography/Heading";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>
        <Heading level={2}>404 - Page Not Found</Heading>
        <p>Sorry, the page you are looking for does not exist.</p>
      </div>
    </div>
  );
}
