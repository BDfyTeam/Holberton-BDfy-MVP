import React, { useState } from "react";
import { createAuction } from "~/services/fetchService";
import type { AuctionCard } from "~/services/types";

export default function CreateAuctionButton() {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [category, setCategory] = useState<string[]>([]);
    const [status, setStatus] = useState(2);
    const [street, setStreet] = useState("");
    const [streetNumber, setStreetNumber] = useState(0);
    const [corner, setCorner] = useState("");
    const [zipCode, setZipCode] = useState(0);
    const [department, setDepartment] = useState("");
    const [details, setDetails] = useState("");

    const openForm = () => {
        setShowForm(true);
    };
    const closeForm = () => {
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: AuctionCard = {
            title,
            description,
            startAt,
            endAt,
            category,
            status,
            direction: {
                street,
                streetNumber,
                corner,
                zipCode,
                department
            },
            details
        };

        const success = await createAuction(payload);
        if (success) {
            closeForm();
            alert("Subasta creada con éxito");
        }
    };

    return (
        <div>
            <button
                onClick={openForm}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full hover:shadow-lg transition duration-300 ease-in-out"
            >
                Crear Subasta
            </button>
            {showForm && (
                <div
                onClick={closeForm}
                className="fixed inset-0 bg-black bg-opacity-10 z-50"
                />
            )}
        </div>
    );
}