import * as React from "react";

import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Modal from "react-bootstrap/Modal";

import { TeamBadges } from "./teamBadges";
import { TeamMemberNode } from "../../types/teamMemberNode";
import { GatsbyImage, getImage } from "gatsby-plugin-image";

import TeamTag from "../../types/teamTag";
import { Theme } from "@mui/material";

type CreditEntryArgs = { member: TeamMemberNode; data: Queries.TeamPageDataQuery; tags: TeamTag[], muiTheme: Theme };

interface CreditEntryState {
	isReady: boolean;
	showModal: boolean;
	modalIsReady: boolean;
}

export class CreditEntry extends React.Component<CreditEntryArgs, CreditEntryState> {
	assetBasePath: string;

	constructor(props: CreditEntryArgs) {
		super(props);

		// Definitely assigned assetBasePath
		this.assetBasePath = props.data.site?.siteMetadata?.assetBasePath!;

		this.state = {
			isReady: false,
			showModal: false,
			modalIsReady: false,
		};
	}

	componentDidMount(): void {
		this.setState({ isReady: true });
	}

	render() {
		/**
	 * There is a bug which manifests when using the filter system.
	 * To reproduce, deselect all, then select year12, then staff.
	 * All is well.
	 * Then deselect year12 and the staff entries' teamBadgeEntries are set to what was previously in that position.
	 * So in this case, they show y12.
	 * However, this.props.tags is fine. So we can recreate that array here as a hacky fix.
	 */
		if (!this.state.isReady) {
			return <div>Loading... </div>;
		} else {
			if (this.state.showModal && !this.state.modalIsReady) {
				// Preload the modal image
				const image = new Image();
				image.onload = () => {
					this.setState({ modalIsReady: true });
				};
				image.src = this.assetBasePath + this.props.member.picturePath;
			}
			const image = getImage(this.props.member.dynamicImage!);
			return (
				<div style={{ padding: 16 }}>
					<Card>
						<Row>
							<div className="col-md-4" onClick={() => this.setState({ showModal: true })}>
								{/*<Card.Img src={this.assetBasePath + this.props.member.picturePath} />*/}
								<GatsbyImage image={image} />
							</div>
							<div className="col-md-8">
								<Card.Body>
									<Card.Title>{this.props.member.name}</Card.Title>
									{/* If this person has a title, display it under their name. Otherwise, don't display anything there. */}
									{this.props.member.title ? (
										<Card.Subtitle>{this.props.member.title}</Card.Subtitle>
									) : undefined}

									{/* Display the person's description */}
									<br />
									{this.props.member.description}
									<br />
									<TeamBadges tags={
										this.props.member.tags.map(tagName => {
											// Use this.props.tags (TeamTag[]) to look up the TeamTag instance for this tag.
											// This instance includes the tag colour.
											// All in-use tags are registered in team.tsx.
											// Therefore, we can notNull the find response.
											const tag = this.props.tags.find(t => t.name == tagName)!

											return tag;
										})
									} muiTheme={this.props.muiTheme} />
								</Card.Body>
							</div>
						</Row>
					</Card>
					{/** Modal when clicking on the image for a higher res version. */}
					<Modal show={this.state.showModal} onHide={() => this.setState({ showModal: false })}>
						<Modal.Header closeButton>
							<Modal.Title>{this.props.member.title}</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							{this.state.modalIsReady ? (
								<Card.Img src={this.assetBasePath + this.props.member.picturePath} />
							) : (
								<div>Loading...</div>
							)}
						</Modal.Body>
					</Modal>
				</div>
			);
		}
	}
}
