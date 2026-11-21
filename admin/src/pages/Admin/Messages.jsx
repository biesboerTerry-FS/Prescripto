import React from "react";
import MessagesPanel from "../../components/MessagesPanel";

const Messages = () => (
	<div className="flex-1 p-5 max-h-[90vh] overflow-y-auto" tabIndex={0}>
		<MessagesPanel role="admin" senderName="Administrator" />
	</div>
);

export default Messages;
