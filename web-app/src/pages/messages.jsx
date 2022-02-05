import React from "react";
import { Layout } from "../components/layout";

const queryMessages = () => {
  return [{
    id: 1,
    message: 'test1',
  }];
}

export const Messages = () => {
  const messages = queryMessages();
  return (
    <Layout>
      <table>
        <tr>
          <th>ID</th>
          <th>Message</th>
        </tr>
        {
          messages.map(({ id, message }) => (
          <tr>
            <td>{id}</td>
            <td>{message}</td>
          </tr>
          ))
        }
      </table>
    </Layout>
  )
};