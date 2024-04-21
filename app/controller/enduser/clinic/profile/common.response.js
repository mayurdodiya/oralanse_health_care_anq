module.exports = {

    modifyOwnerRes: (response) => {
        const obj = {
            id: response.data.id,
            role_id: response.data.role_id,
            is_active: response.data.is_active,
            full_name: response.data.full_name,
            email: response.data.email,
            slug: response.data.slug,
            countryCode: response.data.countryCode,
            phone_no: response.data.phone_no,
            profile_image: response.data.profile_image,
            user_details: response.data.user_details,
            proof_type: response.hospitalAdmin.proof_type,
            identity_proof_doc_path: response.hospitalAdmin.identity_proof_doc_path,
        }
        return obj
    },
    modifyDoctorRes: (response) => {
        const obj = {
            id: response.id,
            role_id: response.role_id,
            is_active: response.is_active,
            full_name: response.full_name,
            email: response.email,
            slug: response.slug,
            countryCode: response.countryCode,
            phone_no: response.phone_no,
            profile_image: response.profile_image,
            user_details: response.user_details,
            doctors: response.doctors,
        }
        return obj
    },
    modifyClinicDoctorRes: (response) => {
        const obj = {
            id: response.id,
            role_id: response.role_id,
            full_name: response.full_name,
            email: response.email,
            slug: response.slug,
            countryCode: response.countryCode,
            phone_no: response.phone_no,
            profile_image: response.profile_image,
            user_details: response.user_details,
            doctors: {
                id: response.doctors.id,
                status: response.doctors.status,
                prefix: response.doctors.prefix,
                doctor_type: response.doctors.doctor_type,
                experience: response.doctors.experience,
                createdAt: response.doctors.createdAt,
                document_type: response.doctors.document_type,
                front_side_document: response.doctors.front_side_document,
                back_side_document: response.doctors.back_side_document,
                consultation_fees: response.doctors.consultation_fees,
                doctorAchievement: response.doctors.doctorAchievement ? response.doctors.doctorAchievement : null,
                doctor_educations: response.doctors.doctor_educations ? response.doctors.doctor_educations : null,
                doctor_registration_details: response.doctors.doctor_registration_details,
                doctor_specialities: response.doctors.doctor_specialities,
                doctor_timing: response.doctors.doctor_timing ? response.doctors.doctor_timing : null,
            },
        }
        return obj
    },
}