import React, { useCallback, useRef } from "react";
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import { Formik, Form } from "formik";
import { camelCase } from "camel-case";
import { Snackbar } from "@rmwc/snackbar";
import "@rmwc/snackbar/styles";
import { TextField } from "../Components/TextField";
import { formatError } from "../util/error";
import * as models from "../models";
import { validate } from "../util/formikValidateJsonSchema";
import { GET_ROLES } from "./RoleList";

const INITIAL_VALUES: Partial<models.AppRole> = {
  name: "",
  displayName: "",
  description: "",
};

type Props = {
  applicationId: string;
  onRoleAdd?: (role: models.AppRole) => void;
};

const FORM_SCHEMA = {
  required: ["displayName"],
  properties: {
    displayName: {
      type: "string",
      minLength: 2,
    },
  },
};

const NewRole = ({ onRoleAdd, applicationId }: Props) => {
  const [createRole, { error, loading }] = useMutation(CREATE_ROLE, {
    update(cache, { data }) {
      if (!data) return;

      const queryData = cache.readQuery<{ appRoles: models.AppRole[] }>({
        query: GET_ROLES,
        variables: {
          id: applicationId,
          orderBy: undefined,
          whereName: undefined,
        },
      });
      if (queryData === null) {
        return;
      }
      cache.writeQuery({
        query: GET_ROLES,
        variables: {
          id: applicationId,
          orderBy: undefined,
          whereName: undefined,
        },
        data: {
          appRoles: queryData.appRoles.concat([data.createAppRole]),
        },
      });
    },
  });
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = useCallback(
    (data, actions) => {
      createRole({
        variables: {
          data: {
            ...data,
            name: camelCase(data.displayName),

            app: { connect: { id: applicationId } },
          },
        },
      }).then((result) => {
        if (onRoleAdd) {
          onRoleAdd(result.data.createAppRole);
        }
        actions.resetForm();
        inputRef.current?.focus();
      });
    },
    [createRole, applicationId, inputRef, onRoleAdd]
  );

  const errorMessage = formatError(error);

  return (
    <>
      <Formik
        initialValues={INITIAL_VALUES}
        validate={(values: Partial<models.AppRole>) =>
          validate(values, FORM_SCHEMA)
        }
        validateOnBlur={false}
        onSubmit={handleSubmit}
      >
        <Form>
          <TextField
            required
            name="displayName"
            label="New Role Name"
            disabled={loading}
            inputRef={inputRef}
            autoFocus
            trailingButton={{ icon: "add", title: "Add Role" }}
            hideLabel
            placeholder="Type role name"
          />
        </Form>
      </Formik>
      <Snackbar open={Boolean(error)} message={errorMessage} />
    </>
  );
};

export default NewRole;

type RouteParams = {
  application?: string;
  entity?: string;
};

const CREATE_ROLE = gql`
  mutation createAppRole($data: AppRoleCreateInput!) {
    createAppRole(data: $data) {
      id
      name
      displayName
    }
  }
`;
