import AppLayout from 'layout/app-layout';
import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  Spinner,
  FormErrorMessage,
  Switch,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
} from '@chakra-ui/react';
import { useFormik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { FiEdit3 } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { createDnsLog } from 'apiSdk/dns-logs';
import { Error } from 'components/error';
import { dnsLogValidationSchema } from 'validationSchema/dns-logs';
import { AsyncSelect } from 'components/async-select';
import { ArrayFormField } from 'components/array-form-field';
import { AccessOperationEnum, AccessServiceEnum, withAuthorization } from '@roq/nextjs';
import { OrganizationInterface } from 'interfaces/organization';
import { getOrganizations } from 'apiSdk/organizations';
import { DnsLogInterface } from 'interfaces/dns-log';

function DnsLogCreatePage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleSubmit = async (values: DnsLogInterface, { resetForm }: FormikHelpers<any>) => {
    setError(null);
    try {
      await createDnsLog(values);
      resetForm();
      router.push('/dns-logs');
    } catch (error) {
      setError(error);
    }
  };

  const formik = useFormik<DnsLogInterface>({
    initialValues: {
      log_data: '',
      organization_id: (router.query.organization_id as string) ?? null,
    },
    validationSchema: dnsLogValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
  });

  return (
    <AppLayout>
      <Box bg="white" p={4} rounded="md" shadow="md">
        <Box mb={4}>
          <Text as="h1" fontSize="2xl" fontWeight="bold">
            Create Dns Log
          </Text>
        </Box>
        {error && (
          <Box mb={4}>
            <Error error={error} />
          </Box>
        )}
        <form onSubmit={formik.handleSubmit}>
          <FormControl id="log_data" mb="4" isInvalid={!!formik.errors?.log_data}>
            <FormLabel>Log Data</FormLabel>
            <Input type="text" name="log_data" value={formik.values?.log_data} onChange={formik.handleChange} />
            {formik.errors.log_data && <FormErrorMessage>{formik.errors?.log_data}</FormErrorMessage>}
          </FormControl>
          <AsyncSelect<OrganizationInterface>
            formik={formik}
            name={'organization_id'}
            label={'Select Organization'}
            placeholder={'Select Organization'}
            fetcher={getOrganizations}
            renderOption={(record) => (
              <option key={record.id} value={record.id}>
                {record?.name}
              </option>
            )}
          />
          <Button isDisabled={formik?.isSubmitting} colorScheme="blue" type="submit" mr="4">
            Submit
          </Button>
        </form>
      </Box>
    </AppLayout>
  );
}

export default withAuthorization({
  service: AccessServiceEnum.PROJECT,
  entity: 'dns_log',
  operation: AccessOperationEnum.CREATE,
})(DnsLogCreatePage);
