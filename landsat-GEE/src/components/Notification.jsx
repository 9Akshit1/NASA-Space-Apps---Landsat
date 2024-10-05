// src/components/Notification.jsx
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

const Notification = ({ acquisitionDate, leadTime }) => {
    useEffect(() => {
        const notify = () => {
            toast(`Landsat is passing over on ${acquisitionDate}!`);
        };

        const timer = setInterval(() => {
            notify();
        }, leadTime * 1000); // Convert seconds to milliseconds

        return () => clearInterval(timer); // Cleanup on unmount
    }, [acquisitionDate, leadTime]);

    return null;
};

export default Notification;
