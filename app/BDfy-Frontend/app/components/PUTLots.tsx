import { useState } from "react";

type Props = {
  className: string;
};

export default function UpdateLots({ className }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [auctionOptions, setAuctionOptions] = useState<{ id: number; title: string }[]>([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [lotNumber, setLotNumber] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [details, setDetails] = useState("");
  
}
