import React, { useState, useEffect } from "react";

import { issue, encodeParameters } from "../services/contract-functions";

import { CopyToClipboard } from 'react-copy-to-clipboard';

import SubmissionModal from "./submission-modal";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Datetime from "react-datetime";
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import "react-datetime/css/react-datetime.css";

export default function IssueForm({ provider }) {

  const [modalShow, setModalShow] = useState(false);

  // Form inputs
  const [address, setAddress] = useState("");
  const [tokenTypeId, setTokenTypeId] = useState(1);
  const [quantity, setQuantity] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [thruDate, setThruDate] = useState("");
  const [automaticRetireDate, setAutomaticRetireDate] = useState("");
  const [metadata, setMetadata] = useState("");
  const [manifest, setManifest] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");

  // Calldata
  const [calldata, setCalldata] = useState("");

  // After initial onFocus for required inputs, display red outline if invalid
  const [initializedAddressInput, setInitializedAddressInput] = useState(false);
  const [initializedQuantityInput, setInitializedQuantityInput] = useState(false);

  function onAddressChange(event) { setAddress(event.target.value); };
  function onTokenTypeIdChange(event) { setTokenTypeId(event.target.value); };
  function onQuantityChange(event) { setQuantity(event.target.value); };
  function onFromDateChange(event) { setFromDate(event._d); };
  function onThruDateChange(event) { setThruDate(event._d); };
  function onAutomaticRetireDateChange(event) { setAutomaticRetireDate(event._d); };
  function onMetadataChange(event) { setMetadata(event.target.value); };
  function onManifestChange(event) { setManifest(event.target.value); };
  function onDescriptionChange(event) { setDescription(event.target.value); };

  function handleSubmit() {
    submit();
    setModalShow(true);
  }

  // update calldata in background in case user wants to copy it with button
  function updateCalldata() {
    let encodedCalldata;
    try {
      encodedCalldata = encodeParameters(
        // types of params
        [
          'address',
          'uint8',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'string',
          'string',
          'string'
        ],
        // value of params
        [
          address,
          tokenTypeId,
          Number(quantity),
          Number(fromDate),
          Number(thruDate),
          Number(automaticRetireDate),
          metadata,
          manifest,
          description
        ]
      );
    } catch (error) {
      encodedCalldata = "";
    }
    setCalldata(encodedCalldata);
  }

  // update calldata on input change
  useEffect(() => {
    updateCalldata()
  }, [
    onAddressChange,
    onTokenTypeIdChange,
    onQuantityChange,
    onFromDateChange,
    onThruDateChange,
    onAutomaticRetireDateChange,
    onMetadataChange,
    onManifestChange,
    onDescriptionChange
  ]);

  async function submit() {
    // If quantity has 3 decimals, multiply by 1000 before passing to the contract
    let quantity_formatted;
    if (tokenTypeId === "3") {
      quantity_formatted = Math.round(quantity * 1000);
    } else {
      quantity_formatted = quantity;
    }

    let result = await issue(provider, address, tokenTypeId, quantity_formatted, fromDate, thruDate, automaticRetireDate, metadata, manifest, description);
    setResult(result.toString());
  }

  const inputError = {
    boxShadow: '0 0 0 0.2rem rgba(220,53,69,.5)',
    borderColor: '#dc3545'
  };

  const tooltipCopiedCalldata = (props) => (
    <Tooltip {...props}>
      Copied to clipboard! Create a proposal using this from the governance page.
    </Tooltip>
  );

  return (
    <>

      <SubmissionModal
        show={modalShow}
        title="Issue tokens"
        body={result}
        onHide={() => {setModalShow(false); setResult("")} }
      />

      <h2>Issue tokens</h2>
      <p>Issue tokens (Renewable Energy Certificate, Carbon Emissions Offset, or Audited Emissions) to registered consumers.</p>
      <Form.Group>
        <Form.Label>Address</Form.Label>
        <Form.Control
          type="input"
          placeholder="0x000..."
          value={address}
          onChange={onAddressChange}
          onBlur={() => setInitializedAddressInput(true)}
          style={(address || !initializedAddressInput) ? {} : inputError}
        />
        <Form.Text className="text-muted">
          Must be a registered consumer.
        </Form.Text>
      </Form.Group>
      <Form.Group>
        <Form.Label>Token Type</Form.Label>
        <Form.Control as="select" onChange={onTokenTypeIdChange}>
          <option value={1}>Renewable Energy Certificate</option>
          <option value={2}>Carbon Emissions Offset</option>
          <option value={3}>Audited Emissions</option>
        </Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label>Quantity</Form.Label>
        <Form.Control
          type="input"
          placeholder={(tokenTypeId === "3") ? "100.000" : "100"}
          value={quantity}
          onChange={onQuantityChange}
          onBlur={() => setInitializedQuantityInput(true)}
          style={(quantity || !initializedQuantityInput) ? {} : inputError}
        />
        {/* Display whether decimal is needed or not */}
        <Form.Text className="text-muted">
          {(tokenTypeId === "3")
            ? "Must not contain more than three decimal values." 
            : "Must be an integer value."
          }
        </Form.Text>
      </Form.Group>
      <Form.Row>
        <Form.Group as={Col}>
          <Form.Label>From date</Form.Label>
          <Datetime onChange={onFromDateChange}/>
        </Form.Group>
        <Form.Group as={Col}>
          <Form.Label>Through date</Form.Label>
          <Datetime onChange={onThruDateChange}/>
        </Form.Group>
        <Form.Group as={Col}>
          <Form.Label>Automatic retire date</Form.Label>
          <Datetime onChange={onAutomaticRetireDateChange}/>
        </Form.Group>
      </Form.Row>
      <Form.Group>
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" placeholder="" value={description} onChange={onDescriptionChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Metadata</Form.Label>
        <Form.Control as="textarea" placeholder="E.g. Region and time of energy generated, type of project, location, etc." value={metadata} onChange={onMetadataChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Manifest</Form.Label>
        <Form.Control as="textarea" placeholder="E.g. URL linking to the registration for the REC, emissions offset purchased, etc." value={manifest} onChange={onManifestChange} />
      </Form.Group>

      <Row>
        <Col>
          <OverlayTrigger
            trigger="click"
            placement="top"
            rootClose={true}
            delay={{ show: 250, hide: 400 }}
            overlay={tooltipCopiedCalldata}
          >              
            <CopyToClipboard text={calldata}>
              <Button
                variant="secondary"
                size="lg"
                block
                disabled={calldata.length === 0}
              >
                Copy calldata
              </Button>
            </CopyToClipboard>
          </OverlayTrigger>
        </Col>
        <Col>
          <Button
            variant="primary"
            size="lg"
            block
            onClick={handleSubmit}
            disabled={calldata.length === 0}
          >
            Issue
          </Button>
        </Col>
      </Row>
      
    </>
  );
}