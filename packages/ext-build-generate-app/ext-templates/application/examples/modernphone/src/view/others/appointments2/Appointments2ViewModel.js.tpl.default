Ext.define('{appName}.view.appointments2.Appointments2ViewModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.appointments2viewmodel',
		stores: {
			appointments: {
				autoLoad: true,
				data: [
					{ ApptNumber: "PYN201612221033", ApptHospitalName: "PYNEH", AppointmentHospitalChineseName: "東區醫院", AppointmentSpeciality: "Medical", AptStartDtm: "03/27/16 04:02", AptEndDtm: "3/27/16 5:17", AptAttendanceIndicator: "Y", AptArrivalDtm: "3/27/16 4:02", AptCompleteDtm: "3/27/16 5:17"},
					{ ApptNumber: "PYN201622221036", ApptHospitalName: "PYNEH", AppointmentHospitalChineseName: "東區醫院", AppointmentSpeciality: "Medical", AptStartDtm: "04/07/16 09:53", AptEndDtm: "4/7/16 11:08", AptAttendanceIndicator: "N", AptArrivalDtm: "4/7/16 9:53", AptCompleteDtm: "4/7/16 11:08"},
					{ ApptNumber: "PYN201632221039", ApptHospitalName: "PYNEH", AppointmentHospitalChineseName: "東區醫院", AppointmentSpeciality: "Medical", AptStartDtm: "04/18/16 15:43", AptEndDtm: "4/18/16 16:59", AptAttendanceIndicator: "N", AptArrivalDtm: "4/18/16 15:43", AptCompleteDtm: "4/18/16 16:59"},
					{ ApptNumber: "PYN201642221042", ApptHospitalName: "PYNEH", AppointmentHospitalChineseName: "東區醫院", AppointmentSpeciality: "Medical", AptStartDtm: "04/29/16 21:34", AptEndDtm: "4/29/16 22:50", AptAttendanceIndicator: "Y", AptArrivalDtm: "4/29/16 21:34", AptCompleteDtm: "4/29/16 22:50"},
					{ ApptNumber: "PYN201652221045", ApptHospitalName: "PYNEH", AppointmentHospitalChineseName: "東區醫院", AppointmentSpeciality: "Medical", AptStartDtm: "05/11/16 03:25", AptEndDtm: "5/11/16 4:40", AptAttendanceIndicator: "Y", AptArrivalDtm: "5/11/16 3:25", AptCompleteDtm: "5/11/16 4:40"},
					{ ApptNumber: "PYN201662221048", ApptHospitalName: "PYNEH", AppointmentHospitalChineseName: "東區醫院", AppointmentSpeciality: "Medical", AptStartDtm: "05/22/16 09:16", AptEndDtm: "5/22/16 10:31", AptAttendanceIndicator: "Y", AptArrivalDtm: "5/22/16 9:16", AptCompleteDtm: "5/22/16 10:31"},
					{ ApptNumber: "PYN201672221051", ApptHospitalName: "PYNEH", AppointmentHospitalChineseName: "東區醫院", AppointmentSpeciality: "Medical", AptStartDtm: "06/02/16 15:06", AptEndDtm: "6/2/16 16:22", AptAttendanceIndicator: "Y", AptArrivalDtm: "6/2/16 15:06", AptCompleteDtm: "6/2/16 16:22"},
					{ ApptNumber: "PYN201682221054", ApptHospitalName: "PYNEH", AppointmentHospitalChineseName: "東區醫院", AppointmentSpeciality: "Medical", AptStartDtm: "06/13/16 20:57", AptEndDtm: "6/13/16 22:13", AptAttendanceIndicator: "Y", AptArrivalDtm: "6/13/16 20:57", AptCompleteDtm: "6/13/16 22:13"},
				],
				xgrouper: {
					groupFn: function(record) {
						var date = Ext.Date.clearTime(new Date(record.get('AptArrivalDtm'))),
							today = Ext.Date.clearTime(new Date());
						if (Ext.Date.isEqual(date, today)) {
							return 'Today';
						} else if (Ext.Date.isEqual(date, Ext.Date.subtract(today, Ext.Date.DAY, 1))) {
							return 'Yesterday'
						} else {
							return Ext.Date.format(date, 'D, F jS, Y');
						}
					}
				}
			}
		}
	});



	/*
					{ ApptNumber: "PYN201602221030", ApptHospitalName: "PYNEH", AppointmentHospitalChineseName: "東區醫院", AppointmentSpeciality: "Medical", AptStartDtm: "3/15/2016 10:11:32 PM", AptEndDtm: "3/15/2016 11:27:05 PM", AptAttendanceIndicator: "Y", AptArrivalDtm: "3/15/2016  10:11:32 PM", AptCompleteDtm: "3/15/2016  11:27:05 PM"},


{ ApptNumber: "PYN201692221057", ApptHospitalName: "PYNEH", AppointmentHospitalChineseName: "東區醫院", AppointmentSpeciality: "Medical", AptStartDtm: "6/25/16 2:48", AptEndDtm: "6/25/16 4:04", AptAttendanceIndicator: "N		
					{ ApptNumber: "", ApptHospitalName: "", AppointmentHospitalChineseName: "", AppointmentSpeciality: "",AptStartDtm: "", AptEndDtm: "", AptAttendanceIndicator: "", AptArrivalDtm: "", AptCompleteDtm: ""},

					123456789012	PYN201702221060	PYNEH	東區醫院	Medical	7/6/16 8:39	7/6/16 9:54	Y	7/6/16 8:39	7/6/16 9:54
					123456789012	PYN201712221063	PYNEH	東區醫院	Medical	7/17/16 14:30	7/17/16 15:45	Y	7/17/16 14:30	7/17/16 15:45
					123456789012	PYN201722221066	PYNEH	東區醫院	Medical	7/28/16 20:20	7/28/16 21:36	Y	7/28/16 20:20	7/28/16 21:36
					123456789012	PYN201732221069	PYNEH	東區醫院	Medical	8/9/16 2:11	8/9/16 3:27	N		
					123456789012	PYN201742221072	PYNEH	東區醫院	Medical	8/20/16 8:02	8/20/16 9:17	Y	8/20/16 8:02	8/20/16 9:17
					123456789012	PYN201752221075	PYNEH	東區醫院	Medical	8/31/16 13:53	8/31/16 15:08	Y	8/31/16 13:53	8/31/16 15:08
					123456789012	PYN201762221078	PYNEH	東區醫院	Medical	9/11/16 19:43	9/11/16 20:59	Y	9/11/16 19:43	9/11/16 20:59
					123456789012	PYN201772221081	PYNEH	東區醫院	Medical	9/23/16 1:34	9/23/16 2:50	Y	9/23/16 1:34	9/23/16 2:50
					123456789012	PYN201782221084	PYNEH	東區醫院	Medical	10/4/16 7:25	10/4/16 8:40	Y	10/4/16 7:25	10/4/16 8:40
					123456789012	PYN201792221087	PYNEH	東區醫院	Cardiothoracic	10/15/16 13:16	10/15/16 14:31	Y	10/15/16 13:16	10/15/16 14:31
					123456789012	PYN201802221090	PYNEH	東區醫院	Cardiothoracic	10/26/16 19:06	10/26/16 20:22	N		
					123456789012	PYN201812221093	PYNEH	東區醫院	Cardiothoracic	11/7/16 0:57	11/7/16 2:13	N		
					123456789012	PYN201822221096	PYNEH	東區醫院	Cardiothoracic	11/18/16 6:48	11/18/16 8:03	Y	11/18/16 6:48	11/18/16 8:03
					123456789012	PYN201832221099	PYNEH	東區醫院	Cardiothoracic	11/29/16 12:39	11/29/16 13:54	Y	11/29/16 12:39	11/29/16 13:54
					123456789012	PYN201842221102	PYNEH	東區醫院	Cardiothoracic	12/10/16 18:29	12/10/16 19:45	Y	12/10/16 18:29	12/10/16 19:45
					123456789012	PYN201852221105	PYNEH	東區醫院	Cardiothoracic	12/22/16 0:20	12/22/16 1:36	Y	12/22/16 0:20	12/22/16 1:36
					123456789012	PYN201862221108	PYNEH	東區醫院	Cardiothoracic	1/2/17 6:11	1/2/17 7:27	Y	1/2/17 6:11	1/2/17 7:27
					123456789012	PYN201872221111	PYNEH	東區醫院	Cardiothoracic	1/13/17 12:02	1/13/17 13:17	Y	1/13/17 12:02	1/13/17 13:17
					123456789012	PYN201882221114	PYNEH	東區醫院	Pathology	1/24/17 17:53	1/24/17 19:08	Y	1/24/17 17:53	1/24/17 19:08
					123456789012	PYN201892221117	PYNEH	東區醫院	Pathology	2/4/17 23:43	2/5/17 0:59	Y	2/4/17 23:43	2/5/17 0:59
					123456789012	PYN201902221120	PYNEH	東區醫院	Pathology	2/16/17 5:34	2/16/17 6:50	Y	2/16/17 5:34	2/16/17 6:50
					123456789012	PYN201912221123	PYNEH	東區醫院	Pathology	2/27/17 11:25	2/27/17 12:40	Y	2/27/17 11:25	2/27/17 12:40
					123456789012	PYN201922221126	PYNEH	東區醫院	Pathology	3/10/17 17:16	3/10/17 18:31	Y	3/10/17 17:16	3/10/17 18:31
					123456789012	PYN201932221129	PYNEH	東區醫院	Pathology	3/21/17 23:06	3/22/17 0:22	N		
					123456789012	PYN201942221132	PYNEH	東區醫院	Pathology	4/2/17 4:57	4/2/17 6:13	Y	4/2/17 4:57	4/2/17 6:13
					123456789012	PYN201952221135	PYNEH	東區醫院	Accident & Emergency	4/13/17 10:48	4/13/17 12:03	Y	4/13/17 10:48	4/13/17 12:03
					123456789012	PYN201962221138	PYNEH	東區醫院	Accident & Emergency	4/24/17 16:39	4/24/17 17:54	Y	4/24/17 16:39	4/24/17 17:54
					123456789012	PYN201972221141	PYNEH	東區醫院	Accident & Emergency	5/5/17 22:29	5/5/17 23:45	Y	5/5/17 22:29	5/5/17 23:45
					123456789012	PYN201982221144	PYNEH	東區醫院	Accident & Emergency	5/17/17 4:20	5/17/17 5:36	Y	5/17/17 4:20	5/17/17 5:36
					123456789012	PYN201992221147	PYNEH	東區醫院	Accident & Emergency	5/28/17 10:11	5/28/17 11:27	Y	5/28/17 10:11	5/28/17 11:27
					123456789012	PYN202002221150	PYNEH	東區醫院	Accident & Emergency	6/8/17 16:02	6/8/17 17:17	Y	6/8/17 16:02	6/8/17 17:17
					123456789012	PYN202012221153	PYNEH	東區醫院	Accident & Emergency	6/19/17 21:53	6/19/17 23:08	Y	6/19/17 21:53	6/19/17 23:08
					123456789012	PYN202022221156	PYNEH	東區醫院	Accident & Emergency	7/1/17 3:43	7/1/17 4:59	Y	7/1/17 3:43	7/1/17 4:59
					123456789012	PYN202032221159	PYNEH	東區醫院	Radiology	7/12/17 9:34	7/12/17 10:50	N		
					123456789012	PYN202042221162	PYNEH	東區醫院	Radiology	7/23/17 15:25	7/23/17 16:40	Y	7/23/17 15:25	7/23/17 16:40
					123456789012	PYN202052221165	PYNEH	東區醫院	Radiology	8/3/17 21:16	8/3/17 22:31	Y	8/3/17 21:16	8/3/17 22:31
					123456789012	PYN202062221168	PYNEH	東區醫院	Radiology	12/3/17 21:16			12/3/17 21:16	
					123456789012	PYN202072221171	PYNEH	東區醫院	Radiology	8/3/18 21:16			8/3/18 21:16	
					123456789012	PYN202082221174	PYNEH	東區醫院	Radiology	8/3/18 21:16			8/3/18 21:16	
					123456789012	KWH201603131030	Kwong Wah Hospital	廣華醫院	Medical	2/29/16 3:03	2/29/16 5:01	Y	2/29/16 3:03	2/29/16 5:01
					123456789012	KWH201613131033	Kwong Wah Hospital	廣華醫院	Medical	3/3/16 13:58	3/3/16 15:57	Y	3/3/16 13:58	3/3/16 15:57
					123456789012	KWH201631321036	Kwong Wah Hospital	廣華醫院	Medical	3/7/16 0:54	3/7/16 2:53	Y	3/7/16 0:54	3/7/16 2:53
					123456789012	KWH201633131039	Kwong Wah Hospital	廣華醫院	Medical	3/10/16 11:50	3/10/16 13:49	Y	3/10/16 11:50	3/10/16 13:49
					123456789012	KWH201643131042	Kwong Wah Hospital	廣華醫院	Medical	3/13/16 22:46	3/14/16 0:45	Y	3/13/16 22:46	3/14/16 0:45
					123456789012	KWH201653131045	Kwong Wah Hospital	廣華醫院	Medical	3/17/16 9:42	3/17/16 11:41	Y	3/17/16 9:42	3/17/16 11:41
					123456789012	KWH201663131048	Kwong Wah Hospital	廣華醫院	Medical	3/20/16 20:38	3/20/16 22:36	Y	3/20/16 20:38	3/20/16 22:36
					123456789012	KWH201673131051	Kwong Wah Hospital	廣華醫院	Medical	3/24/16 7:34	3/24/16 9:32	Y	3/24/16 7:34	3/24/16 9:32
					123456789012	KWH201683131054	Kwong Wah Hospital	廣華醫院	Medical	3/27/16 18:29	3/27/16 20:28	Y	3/27/16 18:29	3/27/16 20:28
					123456789012	KWH201693131057	Kwong Wah Hospital	廣華醫院	Medical	3/31/16 5:25	3/31/16 7:24	Y	3/31/16 5:25	3/31/16 7:24
					123456789012	KWH201703131060	Kwong Wah Hospital	廣華醫院	Medical	4/3/16 16:21	4/3/16 18:20	Y	4/3/16 16:21	4/3/16 18:20
					123456789012	KWH201713131063	Kwong Wah Hospital	廣華醫院	Medical	4/7/16 3:17	4/7/16 5:16	Y	4/7/16 3:17	4/7/16 5:16
					123456789012	KWH201731321066	Kwong Wah Hospital	廣華醫院	Medical	4/10/16 14:13	4/10/16 16:12	N		
					123456789012	KWH201733131069	Kwong Wah Hospital	廣華醫院	Medical	4/14/16 1:09	4/14/16 3:07	Y	4/14/16 1:09	4/14/16 3:07
					123456789012	KWH201743131072	Kwong Wah Hospital	廣華醫院	Medical	4/17/16 12:05	4/17/16 14:03	Y	4/17/16 12:05	4/17/16 14:03
					123456789012	KWH201753131075	Kwong Wah Hospital	廣華醫院	Medical	4/20/16 23:00	4/21/16 0:59	N		
					123456789012	KWH201763131078	Kwong Wah Hospital	廣華醫院	Medical	4/24/16 9:56	4/24/16 11:55	Y	4/24/16 9:56	4/24/16 11:55
					123456789012	KWH201773131081	Kwong Wah Hospital	廣華醫院	Medical	4/27/18 20:52			4/27/18 20:52	
					123456789012	KWH201783131084	Kwong Wah Hospital	廣華醫院	Medical	5/1/18 7:48			5/1/18 7:48	
					123456789012	KWH201793131087	Kwong Wah Hospital	廣華醫院	Cardiothoracic	5/4/16 18:44	5/4/16 20:43	Y	5/4/16 18:44	5/4/16 20:43
					123456789012	KWH201803131090	Kwong Wah Hospital	廣華醫院	Cardiothoracic	5/8/16 5:40	5/8/16 7:38	Y	5/8/16 5:40	5/8/16 7:38
					123456789012	KWH201813131093	Kwong Wah Hospital	廣華醫院	Cardiothoracic	5/11/16 16:36	5/11/16 18:34	Y	5/11/16 16:36	5/11/16 18:34
					123456789012	KWH201831321096	Kwong Wah Hospital	廣華醫院	Cardiothoracic	5/15/16 3:31	5/15/16 5:30	Y	5/15/16 3:31	5/15/16 5:30
					123456789012	KWH201833131099	Kwong Wah Hospital	廣華醫院	Cardiothoracic	5/18/16 14:27	5/18/16 16:26	Y	5/18/16 14:27	5/18/16 16:26
					123456789012	KWH201843131102	Kwong Wah Hospital	廣華醫院	Cardiothoracic	5/22/16 1:23	5/22/16 3:22	Y	5/22/16 1:23	5/22/16 3:22
					123456789012	KWH201853131105	Kwong Wah Hospital	廣華醫院	Accident & Emergency	5/25/16 12:19	5/25/16 14:18	Y	5/25/16 12:19	5/25/16 14:18
					123456789012	KWH201863131108	Kwong Wah Hospital	廣華醫院	Accident & Emergency	5/28/16 23:15	5/29/16 1:14	Y	5/28/16 23:15	5/29/16 1:14
					123456789012	KWH201873131111	Kwong Wah Hospital	廣華醫院	Accident & Emergency	6/1/16 10:11	6/1/16 12:09	Y	6/1/16 10:11	6/1/16 12:09
					123456789012	KWH201883131114	Kwong Wah Hospital	廣華醫院	Radiology	6/4/16 21:07	6/4/16 23:05	Y	6/4/16 21:07	6/4/16 23:05
					123456789012	KWH201893131117	Kwong Wah Hospital	廣華醫院	Radiology	6/8/18 8:02			6/8/18 8:02	
					123456789012	QEH201605011030	Queen Elizabeth Hospital	伊利沙伯醫院	Medical	6/11/16 18:58	6/11/16 20:57	Y	6/11/16 18:58	6/11/16 20:57
					123456789012	QEH201615011033	Queen Elizabeth Hospital	伊利沙伯醫院	Medical	6/15/16 5:54	6/15/16 7:53	Y	6/15/16 5:54	6/15/16 7:53
					123456789012	QEH201650121036	Queen Elizabeth Hospital	伊利沙伯醫院	Medical	6/18/16 16:50	6/18/16 18:49	Y	6/18/16 16:50	6/18/16 18:49
					123456789012	QEH201635011039	Queen Elizabeth Hospital	伊利沙伯醫院	Medical	6/22/16 3:46	6/22/16 5:45	Y	6/22/16 3:46	6/22/16 5:45
					123456789012	QEH201645011042	Queen Elizabeth Hospital	伊利沙伯醫院	Medical	6/25/16 14:42	6/25/16 16:40	Y	6/25/16 14:42	6/25/16 16:40
					123456789012	QEH201655011045	Queen Elizabeth Hospital	伊利沙伯醫院	Medical	6/29/16 1:38	6/29/16 3:36	Y	6/29/16 1:38	6/29/16 3:36
					123456789012	QEH201665011048	Queen Elizabeth Hospital	伊利沙伯醫院	Medical	7/2/16 12:33	7/2/16 14:32	Y	7/2/16 12:33	7/2/16 14:32
					123456789012	QEH201675011051	Queen Elizabeth Hospital	伊利沙伯醫院	Accident & Emergency	7/5/16 23:29	7/6/16 1:28	Y	7/5/16 23:29	7/6/16 1:28
					123456789012	QEH201685011054	Queen Elizabeth Hospital	伊利沙伯醫院	Accident & Emergency	7/9/18 10:25			7/9/18 10:25	
					123456789012	QEH201695011057	Queen Elizabeth Hospital	伊利沙伯醫院	Accident & Emergency	7/12/19 21:21			7/12/19 21:21	
					123456789012	QMH201605011030	Queen Mary Hospital	瑪麗醫院	Medical	7/16/16 8:17	7/16/16 10:16	Y	7/16/16 8:17	7/16/16 10:16
					123456789012	QMH201615011033	Queen Mary Hospital	瑪麗醫院	Medical	7/19/16 19:13	7/19/16 21:11	Y	7/19/16 19:13	7/19/16 21:11
					123456789012	QMH201650121036	Queen Mary Hospital	瑪麗醫院	Medical	7/23/16 6:09	7/23/16 8:07	Y	7/23/16 6:09	7/23/16 8:07
					123456789012	QMH201635011039	Queen Mary Hospital	瑪麗醫院	Medical	7/26/16 17:04	7/26/16 19:03	Y	7/26/16 17:04	7/26/16 19:03
					123456789012	QMH201645011042	Queen Mary Hospital	瑪麗醫院	Medical	7/30/16 4:00	7/30/16 5:59	Y	7/30/16 4:00	7/30/16 5:59
					123456789012	QMH201655011045	Queen Mary Hospital	瑪麗醫院	Medical	8/2/16 14:56	8/2/16 16:55	Y	8/2/16 14:56	8/2/16 16:55
					123456789012	QMH201665011048	Queen Mary Hospital	瑪麗醫院	Medical	8/6/16 1:52	8/6/16 3:51	Y	8/6/16 1:52	8/6/16 3:51
					123456789012	QMH201675011051	Queen Mary Hospital	瑪麗醫院	Medical	8/9/16 12:48	8/9/16 14:47	Y	8/9/16 12:48	8/9/16 14:47
					123456789012	QMH201685011054	Queen Mary Hospital	瑪麗醫院	Accident & Emergency	8/12/16 23:44	8/13/16 1:42	Y	8/12/16 23:44	8/13/16 1:42
					123456789012	QMH201695011057	Queen Mary Hospital	瑪麗醫院	Accident & Emergency	8/16/16 10:40	8/16/16 12:38	Y	8/16/16 10:40	8/16/16 12:38
					123456789012	QMH201705011060	Queen Mary Hospital	瑪麗醫院	Accident & Emergency	12/19/17 21:35			12/19/17 21:35	
					223344556677	QEH201565013048	Queen Elizabeth Hospital	伊利沙伯醫院	Medical	3/31/15 3:29	3/31/15 7:51	Y	3/31/15 3:29	3/31/15 7:51
					223344556677	QEH201575013051	Queen Elizabeth Hospital	伊利沙伯醫院	Medical	4/3/15 14:24	4/3/15 16:23	Y	4/3/15 14:24	4/3/15 16:23
					223344556677	QEH201585013054	Queen Elizabeth Hospital	伊利沙伯醫院	Medical	4/7/15 1:20	4/7/15 3:19	Y	4/7/15 1:20	4/7/15 3:19
					223344556677	QEH201595013057	Queen Elizabeth Hospital	伊利沙伯醫院	Medical	4/10/15 12:16	4/10/15 14:15	Y	4/10/15 12:16	4/10/15 14:15
					223344556677	QMH201504013030	Queen Mary Hospital	瑪麗醫院	Medical	4/13/15 23:12	4/14/15 1:11	Y	4/13/15 23:12	4/14/15 1:11
					223344556677	QMH201515013033	Queen Mary Hospital	瑪麗醫院	Medical	4/17/15 10:08	4/17/15 12:07	Y	4/17/15 10:08	4/17/15 12:07
					223344556677	QMH201550121036	Queen Mary Hospital	瑪麗醫院	Medical	4/20/15 21:04	4/20/15 23:03	Y	4/20/15 21:04	4/20/15 23:03
					223344556677	QMH201535013039	Queen Mary Hospital	瑪麗醫院	Medical	3/2/18 21:08				
					223344556677	KWH201853131205	Kwong Wah Hospital	廣華醫院	Accident & Emergency	4/27/15 18:55	4/27/15 20:54	Y	4/27/15 18:55	4/27/15 20:54
					223344556677	KWH201863131508	Kwong Wah Hospital	廣華醫院	Accident & Emergency	4/30/18 14:58				
					987123456000	PYN201561100538	PYNEH	東區醫院	Medical	12/15/16 13:59	12/15/16 15:57	Y	12/15/16 13:59	12/15/16 15:57
					987123456000	PYN201571100541	PYNEH	東區醫院	Medical	12/19/16 0:55	12/19/16 2:53	Y	12/19/16 0:55	12/19/16 2:53
					987123456000	PYN201581100544	PYNEH	東區醫院	Medical	12/22/16 11:50	12/22/16 13:49	Y	12/22/16 11:50	12/22/16 13:49
					987123456000	PYN201591100547	PYNEH	東區醫院	Medical	12/25/16 22:46	12/26/16 0:45	Y	12/25/16 22:46	12/26/16 0:45
					987123456000	PYN202001100550	PYNEH	東區醫院	Medical	12/29/16 9:42	12/29/16 11:41	Y	12/29/16 9:42	12/29/16 11:41
					987123456000	PYN202011100553	PYNEH	東區醫院	Medical	1/1/17 20:38	1/1/17 22:37	Y	1/1/17 20:38	1/1/17 22:37
					987123456000	PYN202021100556	PYNEH	東區醫院	Medical	1/5/17 7:34	1/5/17 9:33	Y	1/5/17 7:34	1/5/17 9:33
					987123456000	PYN202031100559	PYNEH	東區醫院	Medical	1/8/17 18:30	1/8/17 20:28	Y	1/8/17 18:30	1/8/17 20:28
					987123456000	PYN202041100562	PYNEH	東區醫院	Medical	1/12/18 5:26				
					987123456000	PYN202051100565	PYNEH	東區醫院	Medical	1/15/19 16:21				
*/


