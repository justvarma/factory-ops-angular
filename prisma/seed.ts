import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Roles
  const rolesData = [
    { id: 1, name: "Admin", description: "Full system access. Manages users, roles, system configuration, and has complete control over all modules." },
    { id: 2, name: "PTC Manager", description: "Oversees production tool control (PTC), machine allocation, and ensures operational efficiency on the shop floor." },
    { id: 3, name: "Quality Manager", description: "Responsible for monitoring process quality, implementing quality standards, and handling in-process inspections." },
    { id: 4, name: "Final Quality Manager", description: "Handles final product inspection, approval, and ensures products meet all compliance and customer requirements before dispatch." },
    { id: 5, name: "Storekeeper", description: "Manages inventory, material storage, stock levels, and issuance/receipt of materials." },
    { id: 6, name: "Operator", description: "Operates machines, executes assigned production tasks, and reports machine or process issues." }
  ];

  for (const role of rolesData) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: role,
      create: role,
    });
  }

  // 2. Machines
  const machinesData = [
    { id: 1, type: "CNC", description: "Computer Numerical Control machine used for precision machining operations such as milling, drilling, and cutting." },
    { id: 2, type: "VMC", description: "Vertical Machining Center used for complex milling operations with high accuracy and vertical spindle orientation." },
    { id: 3, type: "Furnace", description: "Industrial furnace used for heat treatment processes like annealing, hardening, and tempering." }
  ];

  for (const machine of machinesData) {
    await prisma.machine.upsert({
      where: { id: machine.id },
      update: machine,
      create: machine,
    });
  }

  // 3. Shifts
  // Note: duration is dbgenerated, so we don't include it
  const shiftsData = [
    { id: 1, name: "Shift1", start_time: "1970-01-01T06:00:00Z", end_time: "1970-01-01T14:00:00Z" },
    { id: 2, name: "Shift2", start_time: "1970-01-01T14:00:00Z", end_time: "1970-01-01T22:00:00Z" },
    { id: 3, name: "Shift3", start_time: "1970-01-01T22:00:00Z", end_time: "1970-01-01T06:00:00Z" }
  ];

  for (const shift of shiftsData) {
    await prisma.shift.upsert({
      where: { id: shift.id },
      update: {
        name: shift.name,
        start_time: new Date(shift.start_time),
        end_time: new Date(shift.end_time),
      },
      create: {
        id: shift.id,
        name: shift.name,
        start_time: new Date(shift.start_time),
        end_time: new Date(shift.end_time),
      },
    });
  }

  // 4. Breaks
  const breaksData = [
    { id: 1, shift_id: 1, break_start: "1970-01-01T10:00:00Z", break_end: "1970-01-01T10:30:00Z", break_type: "Snacks" },
    { id: 2, shift_id: 2, break_start: "1970-01-01T18:00:00Z", break_end: "1970-01-01T18:30:00Z", break_type: "Lunch" },
    { id: 3, shift_id: 3, break_start: "1970-01-01T02:00:00Z", break_end: "1970-01-01T02:30:00Z", break_type: "Toilet" }
  ];

  for (const b of breaksData) {
    await prisma.renamedbreak.upsert({
      where: { id: b.id },
      update: {
        shift_id: b.shift_id,
        break_start: new Date(b.break_start),
        break_end: new Date(b.break_end),
        break_type: b.break_type,
      },
      create: {
        id: b.id,
        shift_id: b.shift_id,
        break_start: new Date(b.break_start),
        break_end: new Date(b.break_end),
        break_type: b.break_type,
      },
    });
  }

  // 5. Users
  const usersData = [
    { id: "23d544c2-c161-4e3e-a650-3030c74ad8a8", username: "quality_mgr2", email: "quality2@company.com", mobile_no: "9876543218", password: "$2a$06$3hX3h7Lhdc83h1PN9HejtOFI86vwkgU/ACgEglbrJOKu3a9Hjp/36", doj: "2023-09-01", role_id: 3 },
    { id: "35f11495-4fcf-4d26-bbbc-64371a6665db", username: "ptc_manager2", email: "ptc2@company.com", mobile_no: "9876543219", password: "$2a$06$PBSWsndWBB4OrId/ydML1.wKtjeSmck7PU5PlEpXCdFVZZhri4Go6", doj: "2023-10-14", role_id: 2 },
    { id: "6aabc42b-612f-4d28-b92d-5e3cb654b52a", username: "quality_mgr1", email: "quality1@company.com", mobile_no: "9876543212", password: "$2a$06$IFsEi1VnkfmkyMILA3hh5OZu8b0uMxmK3.rh7vmNQArwFH2dtGEiq", doj: "2023-03-20", role_id: 3 },
    { id: "6b7a321c-2a5b-4b39-afe7-4367dac697fa", username: "final_quality1", email: "finalq1@company.com", mobile_no: "9876543213", password: "$2a$06$wv258W5UdmkgVHmf7flltOmQW8zj4N3BfKG8T1cMS/JRl5MWRh.V6", doj: "2023-04-05", role_id: 4 },
    { id: "771d1ff2-4e1c-46c0-a7d0-293d444ba864", username: "store_keeper1", email: "store1@company.com", mobile_no: "9876543214", password: "$2a$06$cfep63nBUZ4a06LpkGNhlOeRmXgJD1/jGY6BBlbHf5vlBMK4XE5Ni", doj: "2023-05-12", role_id: 5 },
    { id: "87e9b2a8-602e-4b01-a2fd-2efd4ae7a1ad", username: "operator2", email: "op2@company.com", mobile_no: "9876543216", password: "$2a$06$NKprfV8EGketJ5zP4IJW0Oe6YcLl8Py.d9r0iSPELAUn.DTofz.ei", doj: "2023-07-22", role_id: 6 },
    { id: "ab4bc9fd-6774-4c71-8421-8c192708f900", username: "operator3", email: "op3@company.com", mobile_no: "9876543217", password: "$2a$06$grqdGRcbaDpeNmWvxUB3W.upsXwLo.uLCR5DBaAIgn/psysFQTAhO", doj: "2023-08-10", role_id: 6 },
    { id: "acb504b1-3905-47b4-bd5f-927ca3655e4f", username: "admin_user", email: "admin@company.com", mobile_no: "9876543210", password: "$2a$06$wdQasXlZMvixNJpS54yRSO0VQFTRNtMr5x2RKuH5oqJm92q8IWWem", doj: "2023-01-10", role_id: 1 },
    { id: "be46b117-4205-405b-a49c-4527ff91a2d1", username: "operator1", email: "op1@company.com", mobile_no: "9876543215", password: "$2a$06$RViRqYGy3.1ianNwFnfJ2uxT.HbWWcT7nS2yKg/75JLvPXvE8rWb.", doj: "2023-06-18", role_id: 6 },
    { id: "be6a32b1-3c2c-4838-9b24-8c733c1d0694", username: "ptc_manager1", email: "ptc1@company.com", mobile_no: "9876543211", password: "$2a$06$fU6Nv4MLXWkqfNRxSBkmJ.Gw7T6FY/6osBStjhs.37yiNBnI2ob8O", doj: "2023-02-15", role_id: 2 }
  ];

  for (const user of usersData) {
    await prisma.users.upsert({
      where: { id: user.id },
      update: {
        ...user,
        doj: user.doj ? new Date(user.doj) : null,
      },
      create: {
        ...user,
        doj: user.doj ? new Date(user.doj) : null,
      },
    });
  }

  console.log('Seed data created successfully');

  // Reset sequences to prevent unique constraint errors after seeding with explicit IDs
  await prisma.$executeRaw`SELECT setval('role_id_seq', coalesce((select max(id) from "role"), 1), true)`;
  await prisma.$executeRaw`SELECT setval('machine_id_seq', coalesce((select max(id) from "machine"), 1), true)`;
  await prisma.$executeRaw`SELECT setval('shift_id_seq', coalesce((select max(id) from "shift"), 1), true)`;
  await prisma.$executeRaw`SELECT setval('break_id_seq', coalesce((select max(id) from "break"), 1), true)`;
  
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
