import Container from "@/components/Container";

type Feature = {
  svgIconUrl: string;
  headline: string;
  description: string;
};

const features: Feature[] = [
  {
    svgIconUrl: "list",
    headline: "Smart Chapters",
    description:
      "Our AI analyzes any video and autogenerates a complete, thematic table of contents. Find exactly what you need without watching a second you don't",
  },
  {
    svgIconUrl: "cursor",
    headline: "Click to Learn",
    description:
      "Every word is synchronized. Read along with the video and click any sentence in the transcript to instantly jump to that precise moment.",
  },
  {
    svgIconUrl: "chat",
    headline: "Ask the AI Chat",
    description:
      "Have a question? Ask it. Our AI finds the answer directly from the video's content, explaining concepts and locating key information for you.",
  },
  {
    svgIconUrl: "speed",
    headline: "Flawlessly Optimized",
    description:
      "Built for speed and reliability. Experience a blazingly fast interface with zero lag, so your learning flow is never interrupted.",
  },
];

export default function Features() {
  return (
    <Container className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((item) => (
        <FeatureItem key={crypto.randomUUID()} feature={item} />
      ))}
    </Container>
  );
}

function FeatureItem({ feature }: { feature: Feature }) {
  const { svgIconUrl, headline, description } = feature;
  return (
    <div className="max-w-sm mx-auto p-8 gap-4 flex flex-col items-center bg-gray-700 shadow rounded-xl hover:outline hover:outline-red-500">
      <img
        src={`/${svgIconUrl}.svg`}
        alt={headline}
        className="w-20 h-20 filter invert"
      />
      <div className="flex flex-col">
        <h3 className="font-bold text-lg text-white">{headline}</h3>
        <p className="">{description}</p>
      </div>
    </div>
  );
}
