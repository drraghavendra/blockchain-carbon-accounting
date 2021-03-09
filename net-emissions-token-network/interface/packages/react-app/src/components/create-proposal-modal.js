import React, { useState } from "react";

import { addresses } from "@project/contracts";

import { propose } from "../services/contract-functions";

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';

export default function CreateProposalModal(props) {

  const [calldata, setCalldata] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setIsSubmitting(true);
    let newResult;
    try {

      let args = {
        targets: [ addresses.tokenNetwork.address ],
        values: [ 0 ],
        signatures: [ "issue(address,uint8,uint256,uint256,uint256,uint256,string,string,string)" ],
        calldata: [ calldata ],
        description: description
      }

      let proposeCall = await propose(
        props.provider,
        args.targets,
        args.values,
        args.signatures,
        args.calldata,
        args.description
      );
      newResult = proposeCall.toString()
    } catch (e) {
      newResult = e.message;
    }
    setIsSubmitting(false);
    setResult(newResult);
  }

  function onCalldataChange(event) { setCalldata(event.target.value); };
  function onDescriptionChange(event) { setDescription(event.target.value); };

  return (
    <Modal
      {...props}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        
        <p>Create a proposal to <b>issue tokens</b> from the DAO. 400,000 tokens or 4% of the DAO token supply is required to submit a proposal. Only one active proposal is allowed per user.</p>

        <Form>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={2} placeholder="Describe the purpose of this proposal..." onChange={onDescriptionChange} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Calldata</Form.Label>
            <Form.Control as="textarea" rows={3} onChange={onCalldataChange} />
            <Form.Text className="text-muted">
              Go to the issue page and fill out the form. Click the "copy calldata" button and paste it here.
            </Form.Text>
          </Form.Group>
        </Form>

        { (isSubmitting) &&
          <div className="text-center mt-3">
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
        }

        { (result) &&
          <p className="mt-3">{result}</p>
        }

      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
        <Button variant="success" onClick={submit}>Submit proposal</Button>
      </Modal.Footer>
    </Modal>
  );
}