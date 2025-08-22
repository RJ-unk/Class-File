#include <iostream>
#include <fstream>
#include <openssl/md5.h>
#include <set>

std::set<std::string> known_hashes = {
    "5d41402abc4b2a76b9719d911017c592",
    "098f6bcd4621d373cade4e832627b4f6"
};

std::string md5(const std::string& path) {
    unsigned char c[MD5_DIGEST_LENGTH];
    std::ifstream file(path, std::ios::binary);
    if (!file) {
        std::cerr << "Error opening file.\n";
        return "";
    }

    MD5_CTX mdContext;
    MD5_Init(&mdContext);
    char buffer[1024];
    while (file.read(buffer, sizeof(buffer))) {
        MD5_Update(&mdContext, buffer, file.gcount());
    }
    if (file.gcount() > 0)
        MD5_Update(&mdContext, buffer, file.gcount());

    MD5_Final(c, &mdContext);

    char mdString[33];
    for (int i = 0; i < 16; ++i)
        sprintf(&mdString[i * 2], "%02x", c[i]);
    
    return std::string(mdString);
}

int main(int argc, char* argv[]) {
    if (argc != 2) {
        std::cout << "Usage: scanner <file_path>\n";
        return 1;
    }

    std::string hash = md5(argv[1]);
    std::cout << "MD5: " << hash << std::endl;

    if (known_hashes.find(hash) != known_hashes.end()) {
        std::cout << "⚠️ Threat Detected!" << std::endl;
    } else {
        std::cout << "✅ File is clean." << std::endl;
    }

    return 0;
}
