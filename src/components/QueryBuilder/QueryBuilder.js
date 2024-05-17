import React, { useState } from "react";
import {
  Button,
  Paper,
  Typography,
  TextField,
  Grid,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import "./QueryBuilder.css";

const validationSchema = yup.object({
  tableName: yup.string().required("Table name is required"),
  fieldName: yup.string().required("Field name is required"),
  conditions: yup.array().of(
    yup.object({
      field: yup.string().required("Field is required"),
      operator: yup.string().required("Operator is required"),
      value: yup.string().required("Value is required"),
      value2: yup.string(),
      connector: yup.string().required("Connector is required"),
    })
  ),
  joins: yup.array().of(
    yup.object({
      type: yup.string().required("Join type is required"),
      joinTableName: yup.string().required("Join table name is required"),
      onField: yup
        .string()
        .required("Field name in the main table is required"),
      equalsTo: yup
        .string()
        .required("Field name in the join table is required"),
    })
  ),
});

const QueryBuilder = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const formik = useFormik({
    initialValues: {
      tableName: "",
      fieldName: "",
      conditions: [
        { field: "", operator: "=", value: "", value2: "", connector: "AND" }
      ],
      joins: [{ type: "", joinTableName: "", onField: "", equalsTo: "" }],
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  // Function to handle adding a new condition
  const handleAddCondition = () => {
    const newCondition = {
      field: "",
      operator: "=",
      value: "",
      value2: "",
      connector: "AND",
    };
    const nextConditions = formik.values.conditions.concat(newCondition);
    formik.setFieldValue("conditions", nextConditions);
  };

  // Function to handle removing a specific condition by index
  const handleRemoveCondition = (index) => {
    const nextConditions = formik.values.conditions.filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("conditions", nextConditions);
  };

  // Function to handle adding a new join
  const handleAddJoin = () => {
    const newJoin = {
      type: "",
      joinTableName: "",
      onField: "",
      equalsTo: "",
    };
    const nextJoins = formik.values.joins.concat(newJoin);
    formik.setFieldValue("joins", nextJoins);
  };

  // Function to handle removing a specific join by index
  const handleRemoveJoin = (index) => {
    const nextJoins = formik.values.joins.filter((_, i) => i !== index);
    formik.setFieldValue("joins", nextJoins);
  };

  const constructQuery = (values) => {
    let query = `SELECT ${values.fieldName || ""} FROM ${values.tableName || ""}`;
    
    values.joins.forEach((join) => {
      if (join.type && join.joinTableName && join.onField && join.equalsTo) {
        query += ` ${join.type} JOIN ${join.joinTableName} ON ${join.onField} = ${join.equalsTo}`;
      }
    });
    
    const conditions = values.conditions.filter(
      (condition) => condition.field && condition.value
    );
    
    if (conditions.length > 0) {
      const conditionsString = conditions
        .map((condition, index) => {
          const isNumeric = !isNaN(condition.value) && !isNaN(parseFloat(condition.value));
          let formattedValue = isNumeric ? condition.value : `'${condition.value}'`;
          let conditionString = "";
          if (condition.operator === "BETWEEN") {
            const formattedValue2 = `'${condition.value2}'`;
            conditionString = `${condition.field} ${condition.operator} ${formattedValue} AND ${formattedValue2}`;
          } else {
            conditionString = `${condition.field} ${condition.operator} ${formattedValue}`;
          }
          return index < conditions.length - 1
            ? `${conditionString} ${condition.connector}`
            : conditionString;
        })
        .join(" ");
      query += ` WHERE ${conditionsString}`;
    }
    return query + ";";
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        console.log("Copied to clipboard successfully!");
        setOpenSnackbar(true);
      },
      (err) => {
        console.error("Failed to copy: ", err);
      }
    );
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Paper
      elevation={3}
      style={{ padding: "20px", margin: "20px", paddingBottom: "390px" }}
    >
      <Typography variant="h4" gutterBottom className="query-builder-header">
        SQL Query Builder
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {/* Table Name Input */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="tableName"
              name="tableName"
              label="Table Name"
              value={formik.values.tableName}
              onChange={formik.handleChange}
              error={
                formik.touched.tableName && Boolean(formik.errors.tableName)
              }
              helperText={formik.touched.tableName && formik.errors.tableName}
            />
          </Grid>
          {/* Field Name Input */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="fieldName"
              name="fieldName"
              label="Field Name"
              value={formik.values.fieldName}
              onChange={formik.handleChange}
              error={
                formik.touched.fieldName && Boolean(formik.errors.fieldName)
              }
              helperText={formik.touched.fieldName && formik.errors.fieldName}
            />
          </Grid>
          {/* Conditions Inputs */}
          {formik.values.conditions.map((condition, index) => (
            <Grid item xs={12} key={index}>
              <Paper variant="outlined" style={{ padding: "10px" }}>
                <Grid container spacing={2} alignItems="flex-end">
                  {/* Field Input */}
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label={`Field ${index + 1}`}
                      name={`conditions[${index}].field`}
                      value={condition.field}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                  {/* Operator Dropdown */}
                  <Grid item xs={2}>
                    <TextField
                      select
                      fullWidth
                      label="Operator"
                      name={`conditions[${index}].operator`}
                      value={condition.operator}
                      onChange={(event) => {
                        const updatedConditions = [...formik.values.conditions];
                        updatedConditions[index].operator = event.target.value;
                        formik.setFieldValue("conditions", updatedConditions);
                      }}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="=">=</option>
                      <option value="!=">!=</option>
                      <option value="<">&lt;</option>
                      <option value="<=">&lt;=</option>
                      <option value=">">&gt;</option>
                      <option value=">=">&gt;=</option>
                      <option value="BETWEEN">BETWEEN</option>
                    </TextField>
                  </Grid>
                  {/* Value Input */}
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label={`Value ${index + 1}`}
                      name={`conditions[${index}].value`}
                      value={condition.value}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                  {/* Value2 Input for BETWEEN operator */}
                  {condition.operator === "BETWEEN" && (
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        label={`Value 2 ${index + 1}`}
                        name={`conditions[${index}].value2`}
                        value={condition.value2}
                        onChange={formik.handleChange}
                      />
                    </Grid>
                  )}
                  {/* Connector Dropdown */}
                  {index < formik.values.conditions.length - 1 && (
                    <Grid item xs={2}>
                      <TextField
                        select
                        fullWidth
                        label="Connector"
                        name={`conditions[${index}].connector`}
                        value={condition.connector}
                        onChange={formik.handleChange}
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </TextField>
                    </Grid>
                  )}
                  {/* Removal Button */}
                  <Grid item xs={2}>
                    <IconButton
                      onClick={() => handleRemoveCondition(index)}
                      color="error"
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
          {formik.values.joins.map((join, index) => (
            <Grid item xs={12} key={`join-${index}`}>
              <Paper variant="outlined" style={{ padding: "10px" }}>
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={3}>
                    <TextField
                      select
                      fullWidth
                      label="Join Type"
                      name={`joins[${index}].type`}
                      value={join.type}
                      onChange={formik.handleChange}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option aria-label="None" value="" />
                      <option value="INNER">INNER JOIN</option>
                      <option value="LEFT">LEFT JOIN</option>
                      <option value="RIGHT">RIGHT JOIN</option>
                      <option value="FULL">FULL JOIN</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="Join Table Name"
                      name={`joins[${index}].joinTableName`}
                      value={join.joinTableName}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="On Field (Main Table)"
                      name={`joins[${index}].onField`}
                      value={join.onField}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="Equals To (Join Table)"
                      name={`joins[${index}].equalsTo`}
                      value={join.equalsTo}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                  <Grid item xl={15}>
                    <IconButton
                      onClick={() => handleRemoveJoin(index)}
                      color="error"
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddJoin}
              variant="outlined"
            >
              Add Another Join
            </Button>
          </Grid>
          {/* Add Another Condition Button */}
          <Grid item xs={12}>
            <Button
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddCondition}
              variant="outlined"
            >
              Add Another Condition
            </Button>
          </Grid>
        </Grid>
      </form>
      {/* Query Preview */}
      <div className="query-preview">
        <Typography variant="h6" gutterBottom>
          Your SQL Query:
        </Typography>
        <Grid container alignItems="center">
          <Grid item xs={11}>
            <Typography variant="body1">{constructQuery(formik.values)}</Typography>
          </Grid>
          <Grid item xs={1}>
            <Tooltip title="Copy to Clipboard">
              <IconButton
                onClick={() => copyToClipboard(constructQuery(formik.values))}
                color="primary"
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Query copied to clipboard.
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default QueryBuilder;
