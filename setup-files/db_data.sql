-- INSERT INTO public.user
-- (ref_no, id, email, "firstname", "middlename", "lastname", "password", salt, delete_flag, "emailverify", active_flag, "role", "twofactorauth", "createdat", "updatedat", "maininstallerid")
-- VALUES(1, '8d2cb2e7-0064-43ba-a1ce-b9235b76b37f'::uuid, 'jagadeesan.subbiramanian@trustalchemy.com', 'Jagadeesan', NULL, 'S', '$2b$10$CfI.u7iSK1qdCZtCPCwhBuVJpLh89iZR2mX2iJ5MSggdWyDAeaxlu', '$2b$10$CfI.u7iSK1qdCZtCPCwhBu', 'N'::user_delete_flag_enum, 'Y'::user_emailverify_enum, 'Y'::user_active_flag_enum, 1, 'N'::user_twofactorauth_enum, '2021-10-13 10:21:25.326', '2021-10-14 10:04:46.702', NULL);
-- INSERT INTO public.user
-- (ref_no, id, email, "firstname", "middlename", "lastname", "password", salt, delete_flag, "emailverify", active_flag, "role", "twofactorauth", "createdat", "updatedat", "maininstallerid")
-- VALUES(2, '3e18843c-e369-437f-b0f9-1286c1645396'::uuid, 'dev@trustalchemy.com', 'Jayapriya', NULL, 'S', '$2b$10$cE33nQ7oj1Bk2thqUdVkkeay3kzxn3Z2JOF0zwW75uz6mdIGQzTzG', '$2b$10$cE33nQ7oj1Bk2thqUdVkke', 'N'::user_delete_flag_enum, 'N'::user_emailverify_enum, 'Y'::user_active_flag_enum, 1, 'N'::user_twofactorauth_enum, '2021-08-18 13:42:45.709', '2021-10-28 22:07:25.345', NULL);

-- INSERT INTO public.roles
-- (id, "name", delete_flag, edit_flag, "createdat", "updatedat")
-- VALUES(3, 'admin', 'N'::roles_delete_flag_enum, 'Y'::roles_edit_flag_enum, '2021-10-05 10:09:30.842', '2021-10-05 10:09:30.842');
-- INSERT INTO public.roles
-- (id, "name", delete_flag, edit_flag, "createdat", "updatedat")
-- VALUES(2, 'customer', 'N'::roles_delete_flag_enum, 'N'::roles_edit_flag_enum, '2021-10-04 17:14:05.227', '2021-10-04 17:14:05.227');
-- INSERT INTO public.roles
-- (id, "name", delete_flag, edit_flag, "createdat", "updatedat")
-- VALUES(1, 'super admin', 'N'::roles_delete_flag_enum, 'N'::roles_edit_flag_enum, '2021-09-30 13:49:33.604', '2021-10-27 14:15:11.935');
-- INSERT INTO public.roles
-- (id, "name", delete_flag, edit_flag, "createdat", "updatedat")
-- VALUES(4, 'installer', 'N'::roles_delete_flag_enum, 'N'::roles_edit_flag_enum, '2021-10-05 10:10:13.067', '2021-10-05 10:10:13.067');

INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(1, 1, 1, 1, 1, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(2, 1, 1, 1, 2, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(3, 1, 1, 1, 3, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(4, 1, 1, 1, 4, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(5, 1, 1, 1, 5, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(6, 1, 1, 1, 6, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(7, 1, 1, 2, 7, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(8, 1, 1, 2, 8, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(9, 1, 1, 2, 9, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(10, 1, 1, 2, 10, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(11, 1, 1, 2, 11, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(12, 1, 1, 2, 12, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(13, 1, 1, 2, 13, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(14, 1, 1, 3, 14, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(15, 1, 1, 3, 15, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(16, 1, 1, 3, 16, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(17, 1, 1, 3, 17, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(18, 1, 1, 3, 18, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(19, 1, 1, 3, 19, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(20, 1, 1, 3, 20, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(21, 1, 1, 4, 21, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(22, 1, 1, 4, 22, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(23, 1, 1, 4, 23, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(24, 1, 1, 4, 24, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(25, 1, 1, 4, 25, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(26, 1, 1, 4, 26, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(27, 1, 1, 4, 27, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(28, 1, 1, 5, 28, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(29, 1, 1, 5, 29, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(30, 1, 1, 5, 30, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(31, 1, 1, 5, 31, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(32, 1, 1, 5, 32, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(33, 1, 1, 5, 33, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(34, 1, 1, 5, 34, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(35, 1, 1, 8, 35, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(36, 1, 1, 8, 36, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(37, 1, 1, 8, 37, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(38, 1, 1, 8, 38, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(39, 1, 1, 6, 39, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(40, 1, 1, 7, 40, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(41, 1, 1, 9, 41, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(42, 1, 1, 10, 42, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(43, 1, 1, 8, 48, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(44, 1, 1, 14, 49, 'Y'::rolesmaster_delete_flag_enum, '2021-09-20 18:18:29.899', '2021-10-27 14:16:05.641');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(133, 1, 1, 1, 1, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(134, 1, 1, 1, 2, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(135, 1, 1, 1, 3, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(136, 1, 1, 1, 4, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(137, 1, 1, 1, 5, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(138, 1, 1, 1, 6, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(139, 1, 1, 2, 7, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(140, 1, 1, 2, 8, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(141, 1, 1, 2, 9, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(142, 1, 1, 2, 10, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(143, 1, 1, 2, 11, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(144, 1, 1, 2, 12, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(145, 1, 1, 2, 13, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(146, 1, 1, 3, 14, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(147, 1, 1, 3, 15, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(148, 1, 1, 3, 16, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(149, 1, 1, 3, 17, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(150, 1, 1, 3, 18, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(151, 1, 1, 3, 19, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(152, 1, 1, 3, 20, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(153, 1, 1, 4, 21, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(154, 1, 1, 4, 22, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(155, 1, 1, 4, 23, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(156, 1, 1, 4, 24, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(157, 1, 1, 4, 25, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(158, 1, 1, 4, 26, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(159, 1, 1, 4, 27, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(160, 1, 1, 5, 28, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(161, 1, 1, 5, 29, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(162, 1, 1, 5, 30, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(163, 1, 1, 5, 31, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(164, 1, 1, 5, 32, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(165, 1, 1, 5, 33, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(166, 1, 1, 5, 34, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(167, 1, 1, 8, 35, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(168, 1, 1, 8, 36, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(169, 1, 1, 8, 37, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(170, 1, 1, 8, 38, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(171, 1, 1, 6, 39, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(172, 1, 1, 7, 40, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(173, 1, 1, 9, 41, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(174, 1, 1, 10, 42, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(175, 1, 1, 8, 48, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(176, 1, 1, 14, 49, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(177, 1, 1, 15, 50, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(178, 1, 1, 2, 51, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(179, 1, 1, 2, 52, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(180, 1, 1, 2, 53, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(181, 1, 1, 3, 54, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(182, 1, 1, 3, 55, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(183, 1, 1, 3, 56, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(184, 1, 1, 3, 57, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(185, 1, 1, 3, 58, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(186, 1, 1, 3, 59, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(187, 1, 1, 3, 60, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(188, 1, 1, 15, 61, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(189, 1, 1, 15, 62, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(190, 1, 1, 15, 63, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(191, 1, 1, 15, 64, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(192, 1, 1, 15, 65, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(193, 1, 1, 15, 66, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(194, 1, 1, 15, 67, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(195, 1, 1, 15, 68, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(196, 1, 1, 15, 69, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(197, 1, 1, 15, 70, 'N'::rolesmaster_delete_flag_enum, '2021-10-27 14:16:05.931', '2021-10-27 14:16:05.931');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(205, 3, 1, 10, 42, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(206, 3, 1, 1, 1, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(207, 3, 1, 1, 2, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(208, 3, 1, 1, 3, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(209, 3, 1, 14, 49, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(210, 3, 1, 15, 50, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(211, 3, 1, 15, 61, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(212, 3, 1, 15, 62, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(213, 3, 1, 15, 63, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(214, 3, 1, 15, 64, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(215, 3, 1, 15, 65, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(216, 3, 1, 15, 66, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(217, 3, 1, 15, 67, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(218, 3, 1, 15, 68, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(219, 3, 1, 15, 69, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(220, 3, 1, 15, 70, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:16:24.129', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(221, 3, 1, 1, 1, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:20:18.014', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(222, 3, 1, 1, 4, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:20:18.014', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(223, 3, 1, 1, 5, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:20:18.014', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(224, 3, 1, 1, 6, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:20:18.014', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(225, 3, 1, 1, 1, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:21:44.427', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(226, 3, 1, 1, 4, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:21:44.427', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(227, 3, 1, 1, 5, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:21:44.427', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(228, 3, 1, 1, 6, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:21:44.427', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(229, 3, 1, 1, 2, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:21:44.427', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(230, 3, 1, 1, 3, 'Y'::rolesmaster_delete_flag_enum, '2021-10-28 18:21:44.427', '2021-10-29 13:15:45.513');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(231, 3, 1, 2, 7, 'N'::rolesmaster_delete_flag_enum, '2021-10-29 13:15:45.517', '2021-10-29 13:15:45.517');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(232, 3, 1, 2, 8, 'N'::rolesmaster_delete_flag_enum, '2021-10-29 13:15:45.517', '2021-10-29 13:15:45.517');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(233, 3, 1, 2, 9, 'N'::rolesmaster_delete_flag_enum, '2021-10-29 13:15:45.517', '2021-10-29 13:15:45.517');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(234, 3, 1, 2, 10, 'N'::rolesmaster_delete_flag_enum, '2021-10-29 13:15:45.517', '2021-10-29 13:15:45.517');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(235, 3, 1, 2, 11, 'N'::rolesmaster_delete_flag_enum, '2021-10-29 13:15:45.517', '2021-10-29 13:15:45.517');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(236, 3, 1, 2, 12, 'N'::rolesmaster_delete_flag_enum, '2021-10-29 13:15:45.517', '2021-10-29 13:15:45.517');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(237, 3, 1, 2, 13, 'N'::rolesmaster_delete_flag_enum, '2021-10-29 13:15:45.517', '2021-10-29 13:15:45.517');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(238, 3, 1, 2, 51, 'N'::rolesmaster_delete_flag_enum, '2021-10-29 13:15:45.517', '2021-10-29 13:15:45.517');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(239, 3, 1, 2, 52, 'N'::rolesmaster_delete_flag_enum, '2021-10-29 13:15:45.517', '2021-10-29 13:15:45.517');
INSERT INTO public.rolesmaster
(id, role_id, portal_id, pages_id, pagetabs_id, delete_flag, "createdat", "updatedat")
VALUES(240, 3, 1, 2, 53, 'N'::rolesmaster_delete_flag_enum, '2021-10-29 13:15:45.517', '2021-10-29 13:15:45.517');


INSERT INTO public.portal
(id, "name", delete_flag, active_flag, "createdat", "updatedat")
VALUES(1, 'admin', 'N'::portal_delete_flag_enum, 'Y'::portal_active_flag_enum, '2021-10-04 13:43:00.324', '2021-10-04 13:43:00.324');
INSERT INTO public.portal
(id, "name", delete_flag, active_flag, "createdat", "updatedat")
VALUES(2, 'installer', 'N'::portal_delete_flag_enum, 'Y'::portal_active_flag_enum, '2021-09-07 10:13:23.925', '2021-09-07 10:13:23.925');


INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(1, 'Dashboard', 1, 1, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 10:21:52.845', '2021-09-07 10:21:52.845');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(2, 'Approved Application', 1, 2, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 10:21:52.845', '2021-09-07 10:21:52.845');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(3, 'Pending Application', 1, 3, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 10:21:52.845', '2021-09-07 10:21:52.845');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(4, 'Incomplete Application', 1, 4, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 10:21:52.845', '2021-09-07 10:21:52.845');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(5, 'Denied Application', 1, 5, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 10:21:52.845', '2021-09-07 10:21:52.845');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(6, 'Funded Contracts', 1, 6, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 10:21:52.845', '2021-09-07 10:21:52.845');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(7, 'Archived Open Applications', 1, 7, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 10:21:52.845', '2021-09-07 10:21:52.845');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(8, 'Settings', 1, 8, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 10:21:52.845', '2021-09-07 10:21:52.845');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(9, 'Installer Management', 1, 9, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 10:21:52.845', '2021-09-07 10:21:52.845');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(10, 'Users', 1, 10, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 10:21:52.845', '2021-09-07 10:21:52.845');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(14, 'Start Application', 1, 11, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-20 23:41:13.653', '2021-09-20 23:41:13.653');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(15, 'Funding Contracts', 1, 12, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-10-27 13:50:44.241', '2021-10-27 13:50:44.241');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(16, 'Profile', 2, 3, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 11:00:42.811', '2021-09-07 11:00:42.811');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(17, 'Customers', 2, 2, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 11:00:42.811', '2021-09-07 11:00:42.811');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(18, 'Dashboard', 2, 1, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 11:00:42.811', '2021-09-07 11:00:42.811');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(19, 'Transaction', 2, 4, 'N'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-10-05 23:25:37.206', '2021-10-05 23:25:37.206');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(11, 'Main', 2, 1, 'Y'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 11:00:42.811', '2021-09-07 11:00:42.811');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(12, 'Customers', 2, 2, 'Y'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 11:00:42.811', '2021-09-07 11:00:42.811');
INSERT INTO public.pages
(id, "name", portal_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(13, 'Profile', 2, 3, 'Y'::pages_delete_flag_enum, 'Y'::pages_active_flag_enum, '2021-09-07 11:00:42.811', '2021-09-07 11:00:42.811');

INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(1, 'Approved Application', 1, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(2, 'Pending Application', 1, 2, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(3, 'Incomplete Application', 1, 3, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(4, 'Denied Application', 1, 4, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(5, 'Admin Users', 1, 5, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(6, 'Credit Reports', 1, 6, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(7, 'User Information', 2, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(8, 'Credit Report', 2, 2, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(9, 'Payment Schedule', 2, 3, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(10, 'Bank Accounts', 2, 4, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(11, 'Document Center', 2, 5, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(12, 'Comments', 2, 6, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(13, 'Log', 2, 7, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(14, 'User Information', 3, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(15, 'Credit Report', 3, 2, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(16, 'Payment Schedule', 3, 3, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(17, 'Bank Accounts', 3, 4, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(18, 'Document Center', 3, 5, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(19, 'Comments', 3, 6, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(20, 'Log', 3, 7, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(21, 'User Information', 4, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(22, 'Credit Report', 4, 2, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(23, 'Payment Schedule', 4, 3, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(24, 'Bank Accounts', 4, 4, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(25, 'Document Center', 4, 5, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(26, 'Comments', 4, 6, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(27, 'Log', 4, 7, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(28, 'User Information', 5, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(29, 'Credit Report', 5, 2, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(30, 'Payment Schedule', 5, 3, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(31, 'Bank Accounts', 5, 4, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(32, 'Document Center', 5, 5, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(33, 'Comments', 5, 6, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(34, 'Log', 5, 7, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(35, 'Audit Log', 8, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(36, 'Questions', 8, 2, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(37, 'Admin Security', 8, 3, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(38, 'Roles', 8, 4, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(39, 'No Tabs', 6, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:33:57.703', '2021-09-07 10:33:57.703');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(40, 'No Tabs', 7, 2, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:33:57.703', '2021-09-07 10:33:57.703');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(41, 'No Tabs', 9, 2, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:33:57.703', '2021-09-07 10:33:57.703');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(42, 'No Tabs', 10, 4, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:33:57.703', '2021-09-07 10:33:57.703');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(43, 'Settings', 13, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 11:02:50.887', '2021-09-07 11:02:50.887');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(44, 'Equipment Settings', 13, 2, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 11:02:50.887', '2021-09-07 11:02:50.887');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(45, 'User Managment', 13, 3, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 11:02:50.887', '2021-09-07 11:02:50.887');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(46, 'No Tabs', 11, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 11:04:17.913', '2021-09-07 11:04:17.913');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(47, 'No Tabs', 12, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 11:04:17.913', '2021-09-07 11:04:17.913');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(48, 'DecisionEngine', 8, 5, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-20 15:37:45.545', '2021-09-20 15:37:45.545');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(49, 'No Tabs', 14, 5, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-20 23:44:50.593', '2021-09-20 23:44:50.593');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(50, 'Funding Contract', 15, 12, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(51, 'Document Center', 2, 5, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(52, 'Comments', 2, 6, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(53, 'Log', 2, 7, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(54, 'User Information', 3, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(55, 'Credit Report', 3, 2, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(56, 'Payment Schedule', 3, 3, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(57, 'Bank Accounts', 3, 4, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(58, 'Document Center', 3, 5, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(59, 'Comments', 3, 6, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(60, 'Log', 3, 7, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(61, 'Document Center', 15, 5, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(62, 'Comments', 15, 6, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(63, 'Log', 15, 7, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(64, 'User Information', 15, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(65, 'Credit Report', 15, 2, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(66, 'Payment Schedule', 15, 3, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(67, 'Bank Accounts', 15, 4, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(68, 'Document Center', 15, 5, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(69, 'Comments', 15, 6, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(70, 'Log', 15, 7, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 10:29:40.521', '2021-09-07 10:29:40.521');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(71, 'Settings', 13, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 11:02:50.887', '2021-09-07 11:02:50.887');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(72, 'Equipment Settings', 13, 2, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 11:02:50.887', '2021-09-07 11:02:50.887');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(73, 'User Managment', 13, 3, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 11:02:50.887', '2021-09-07 11:02:50.887');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(74, 'No Tabs', 11, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 11:04:17.913', '2021-09-07 11:04:17.913');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(75, 'No Tabs', 12, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 11:04:17.913', '2021-09-07 11:04:17.913');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(77, 'Settings', 16, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 11:02:50.887', '2021-09-07 11:02:50.887');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(78, 'Equipment Settings', 16, 2, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 11:02:50.887', '2021-09-07 11:02:50.887');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(79, 'User Managment', 16, 3, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 11:02:50.887', '2021-09-07 11:02:50.887');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(80, 'No Tabs', 18, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 11:04:17.913', '2021-09-07 11:04:17.913');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(81, 'No Tabs', 17, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-09-07 11:04:17.913', '2021-09-07 11:04:17.913');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(82, 'No Tabs', 19, 1, 'N'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-10-05 23:32:09.664', '2021-10-05 23:32:09.664');
INSERT INTO public.pagetabs
(id, "name", pages_id, order_no, delete_flag, active_flag, "createdat", "updatedat")
VALUES(76, 'No Tabs', 16, 1, 'Y'::pagetabs_delete_flag_enum, 'Y'::pagetabs_active_flag_enum, '2021-10-05 23:32:09.664', '2021-10-05 23:32:09.664');
