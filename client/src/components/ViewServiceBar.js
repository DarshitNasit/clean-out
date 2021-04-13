import React from "react";

function ViewServiceBar(props) {
	const {
		serviceName,
		serviceCategory,
		subCategories,
		description,
		price,
		workerName,
		status,
		className,
		...rest
	} = props;

	return (
		<div className={`flex flex-col width90 ml-auto mr-auto br-10 p-10 ${className}`} {...rest}>
			<div className="flex flex-row">
				<p className="bold">
					{serviceName} [{serviceCategory}]
				</p>
				{workerName && <p className="ml-auto">{workerName}</p>}
			</div>

			<p className="small-font-size">Sub Categories : {subCategories}</p>

			{description && <p className="small-font-size">Description : {description}</p>}

			<div className="flex flex-row mt-auto">
				{price && <p className="">Price : {price}</p>}
				{status && <p className="ml-auto">Status : {status}</p>}
			</div>
		</div>
	);
}

export default ViewServiceBar;
