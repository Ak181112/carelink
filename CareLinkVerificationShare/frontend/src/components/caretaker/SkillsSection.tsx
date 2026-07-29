interface Props {
  skills: string[];
}

export default function SkillsSection({ skills }: Props) {
  if (!skills.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 pb-10">

      <h2 className="text-3xl font-bold mb-6">
        Skills & Services
      </h2>

      <div className="flex flex-wrap gap-4">
        {skills.map((skill) => (
          <div
            key={skill}
            className="rounded-xl bg-blue-50 px-5 py-3 text-blue-600"
          >
            {skill}
          </div>
        ))}
      </div>

    </section>
  );
}
