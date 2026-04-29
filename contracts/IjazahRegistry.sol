// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IjazahRegistry
 * @notice Smart contract sederhana untuk verifikasi ijazah digital.
 *         Kampus (admin) menyimpan HASH (SHA-256) ijazah + CID IPFS ke chain.
 *         File PDF aslinya disimpan di IPFS (off-chain) — chain hanya menyimpan
 *         "sidik jari" agar siapa pun bisa memverifikasi keaslian ijazah.
 *
 * @dev    Cocok untuk pembelajaran. Untuk produksi, pertimbangkan:
 *         - upgradeability (UUPS / Transparent Proxy)
 *         - revocation list bila ijazah dibatalkan
 *         - role-based access control (OpenZeppelin AccessControl)
 */
contract IjazahRegistry {
    // ============== Types ==============

    struct Cert {
        bytes32 fileHash;   // SHA-256 dari file PDF ijazah
        string  ipfsCid;    // CID IPFS file PDF ijazah
        address issuer;     // alamat admin kampus penginput
        uint256 issuedAt;   // timestamp penerbitan
        bool    exists;     // penanda data ada
    }

    // ============== State ==============

    address public owner;
    mapping(address => bool) public admins;
    // certId (mis. keccak256("IJZ-XXXX-XXXXXX")) => data ijazah
    mapping(bytes32 => Cert) private _certs;

    // ============== Events ==============

    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event CertRegistered(
        bytes32 indexed certId,
        bytes32 indexed fileHash,
        string  ipfsCid,
        address indexed issuer
    );

    // ============== Modifiers ==============

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Not admin");
        _;
    }

    // ============== Constructor ==============

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true; // pemilik kontrak otomatis jadi admin
        emit AdminAdded(msg.sender);
    }

    // ============== Admin management ==============

    function addAdmin(address a) external onlyOwner {
        admins[a] = true;
        emit AdminAdded(a);
    }

    function removeAdmin(address a) external onlyOwner {
        admins[a] = false;
        emit AdminRemoved(a);
    }

    // ============== Core logic ==============

    /**
     * @notice Mendaftarkan ijazah baru ke chain.
     * @param certId   ID sertifikat unik (di-hash dengan keccak256 di sisi client).
     * @param fileHash SHA-256 file PDF ijazah (dikemas dalam bytes32).
     * @param ipfsCid  CID IPFS file PDF ijazah.
     */
    function register(
        bytes32 certId,
        bytes32 fileHash,
        string calldata ipfsCid
    ) external onlyAdmin {
        require(!_certs[certId].exists, "Cert already exists");
        require(fileHash != bytes32(0), "Empty hash");
        require(bytes(ipfsCid).length > 0, "Empty CID");

        _certs[certId] = Cert({
            fileHash: fileHash,
            ipfsCid:  ipfsCid,
            issuer:   msg.sender,
            issuedAt: block.timestamp,
            exists:   true
        });

        emit CertRegistered(certId, fileHash, ipfsCid, msg.sender);
    }

    /**
     * @notice Mengambil data ijazah berdasarkan certId.
     * @return fileHash, ipfsCid, issuer, issuedAt
     */
    function getCert(bytes32 certId)
        external
        view
        returns (bytes32, string memory, address, uint256)
    {
        Cert memory c = _certs[certId];
        require(c.exists, "Cert not found");
        return (c.fileHash, c.ipfsCid, c.issuer, c.issuedAt);
    }

    /**
     * @notice Verifikasi cepat: bandingkan hash yang dimiliki verifikator
     *         dengan hash yang tersimpan di chain.
     */
    function verify(bytes32 certId, bytes32 fileHash) external view returns (bool) {
        Cert memory c = _certs[certId];
        return c.exists && c.fileHash == fileHash;
    }
}
