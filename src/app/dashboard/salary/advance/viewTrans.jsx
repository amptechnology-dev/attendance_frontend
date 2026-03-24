"use client";

import { Modal, Button } from "flowbite-react";
import { useState } from "react";
import Datatable from "../../components/DatatableSimple";
import { columns } from "./transCols";

export default function ViewTrans({ data = [] }) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpenModal(true)}>
        View Transanctions
      </Button>

      <Modal
        show={openModal}
        size="7xl"
        position="top-center"
        onClose={() => setOpenModal(false)}
      >
        <Modal.Body>
          <Datatable
            tableHeading="Advance Salary Transactions"
            columns={columns}
            data={data}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setOpenModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
