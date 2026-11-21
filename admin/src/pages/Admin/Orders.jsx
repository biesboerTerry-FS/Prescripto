import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import OrdersPanel from "../../components/OrdersPanel";

const Orders = () => {
	const { adminToken, appointments, getAllAppointments } = useContext(AdminContext);

	useEffect(() => {
		if (adminToken) getAllAppointments();
	}, [adminToken]);

	return (
		<div className="flex-1 p-5 max-h-[90vh] overflow-y-auto" tabIndex={0}>
			<OrdersPanel role="admin" appointments={appointments} />
		</div>
	);
};

export default Orders;
