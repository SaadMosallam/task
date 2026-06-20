interface Props {
  label: string;
}

export default function Badge({ label }: Props) {
  return (
    <span className="absolute top-2 left-2 z-10 bg-[#4C51BF] text-white text-[10px] font-semibold px-2 py-0.5 rounded">
      {label}
    </span>
  );
}
